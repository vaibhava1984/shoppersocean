import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { sendSaleNotification } from "@/utils/email/sendSaleNotification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(rawBody)
  );
}

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Razorpay webhook secret is not configured");
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    if (!(await verifyWebhookSignature(rawBody, signature, secret))) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Only a server-authenticated captured event can grant book access.
    // Other events are acknowledged without changing purchase access.
    if (event?.event !== "payment.captured") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = event?.payload?.payment?.entity;
    const paymentId = String(payment?.id || "");
    const razorpayOrderId = String(payment?.order_id || "");
    if (!paymentId || !razorpayOrderId || payment?.status !== "captured" || payment?.captured !== true) {
      return NextResponse.json({ error: "Captured payment details are incomplete" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay server credentials are not configured" }, { status: 503 });
    }

    // Verify the canonical order directly with Razorpay rather than trusting webhook notes.
    const orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`,
      { headers: { Authorization: basicAuth(keyId, keySecret) }, cache: "no-store" }
    );
    const razorpayOrder = await orderResponse.json();
    if (!orderResponse.ok || razorpayOrder?.id !== razorpayOrderId) {
      return NextResponse.json({ error: "Could not verify Razorpay order" }, { status: 502 });
    }

    if (
      Number(payment.amount) !== Number(razorpayOrder.amount) ||
      String(payment.currency || "").toUpperCase() !== String(razorpayOrder.currency || "").toUpperCase()
    ) {
      return NextResponse.json({ error: "Captured payment does not match Razorpay order" }, { status: 409 });
    }

    const userId = String(razorpayOrder.notes?.user_id || "");
    const bookId = String(razorpayOrder.notes?.product_id || "");
    const baseAmount = Number(razorpayOrder.notes?.base_amount);
    if (!userId || !bookId || !Number.isFinite(baseAmount) || baseAmount <= 0) {
      return NextResponse.json({ error: "Razorpay order is missing trusted purchase details" }, { status: 409 });
    }

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 503 });

    const order = await db.prepare(
      "SELECT id, user_id, book_id, amount, currency, status FROM orders WHERE razorpay_order_id = ? LIMIT 1"
    ).bind(razorpayOrderId).first<Record<string, any>>();

    // Do not invent purchases from arbitrary webhook events. A pending order must
    // have been written before checkout was made available to the customer.
    if (!order) {
      console.error("Captured payment has no saved local order", razorpayOrderId);
      return NextResponse.json({ error: "Saved purchase order not found; retry reconciliation" }, { status: 503 });
    }

    if (
      String(order.user_id) !== userId ||
      String(order.book_id) !== bookId ||
      Math.abs(Number(order.amount) - baseAmount) > 0.01 ||
      String(order.currency || "").toUpperCase() !== "INR"
    ) {
      console.error("Captured payment ownership/price mismatch", razorpayOrderId);
      return NextResponse.json({ error: "Captured payment does not match the saved purchase" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const existingPayment = await db.prepare(
      "SELECT id, order_id, user_id, book_id, razorpay_payment_id FROM payments WHERE razorpay_payment_id = ? LIMIT 1"
    ).bind(paymentId).first<Record<string, any>>();

    if (existingPayment) {
      if (
        String(existingPayment.order_id) !== String(order.id) ||
        String(existingPayment.user_id) !== userId ||
        String(existingPayment.book_id) !== bookId
      ) {
        return NextResponse.json({ error: "Conflicting payment record exists" }, { status: 409 });
      }
      await db.prepare(
        "UPDATE payments SET status = 'completed', updated_at = ? WHERE id = ?"
      ).bind(now, existingPayment.id).run();
    } else {
      await db.prepare(
        "INSERT INTO payments (id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, 'INR', 'completed', ?, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(),
        order.id,
        userId,
        bookId,
        Number(order.amount),
        paymentId,
        razorpayOrderId,
        now,
        now
      ).run();
    }

    await db.prepare(
      "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?"
    ).bind(now, order.id).run();

    // The browser verification route also sends this notification. Resend's
    // payment-specific idempotency key ensures these two paths cannot duplicate it.
    const saleDetails = await db.prepare(
      "SELECT u.email AS customer_email, b.title AS book_title " +
      "FROM users u JOIN books b ON b.id = ? " +
      "WHERE u.id = ? LIMIT 1"
    ).bind(bookId, userId).first<Record<string, any>>();

    if (!saleDetails) {
      throw new Error("Could not load customer and book details for sale notification");
    }

    await sendSaleNotification({
      paymentId,
      customerEmail: String(saleDetails.customer_email || ""),
      bookId,
      bookTitle: String(saleDetails.book_title || ""),
    });

    return NextResponse.json({ received: true, status: "completed" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Razorpay captured-payment webhook failed", error);
    return NextResponse.json({ error: "Webhook processing failed; Razorpay may retry" }, { status: 500 });
  }
}
