import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { Resend } from "resend";
import { getD1 } from "@/utils/cloudflare/d1";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay server credentials are not configured");
  return { keyId, keySecret };
}

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) return false;

  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(orderId + "|" + paymentId)
  );
}

function mapPaymentStatus(status: string) {
  switch (status) {
    case "captured": return "completed";
    case "authorized": return "authorized";
    case "failed": return "failed";
    case "refunded": return "refunded";
    default: return "pending";
  }
}

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const { keyId, keySecret } = getCredentials();
    const body = await req.json();

    const razorpayOrderId = String(body?.razorpay_order_id || "");
    const razorpayPaymentId = String(body?.razorpay_payment_id || "");
    const razorpaySignature = String(body?.razorpay_signature || "");
    const originalCurrency = String(body?.original_currency || "").toUpperCase();
    const originalAmount = Number(body?.original_amount);
    const userId = identity.profile.id;
    const productId = String(body?.product_id || "");
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !productId ||
      !/^[A-Z]{3}$/.test(originalCurrency) ||
      !Number.isFinite(originalAmount) ||
      originalAmount <= 0
    ) {
      return NextResponse.json({ error: "Required payment information is missing or invalid" }, { status: 400 });
    }

    // The payment route uses the same D1/JWT identity as the rest of the application.
    // The authenticated application identity is represented by the stable D1 user id.
    const profile = await db
      .prepare("SELECT id, email, mobile, address FROM profiles WHERE id = ? LIMIT 1")
      .bind(userId)
      .first<Record<string, any>>();

    if (!profile) {
      return NextResponse.json({ error: "Authenticated user was not found" }, { status: 401 });
    }

    const signatureValid = await verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      keySecret
    );

    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Fetch the Razorpay order and payment directly. This prevents the client
    // from changing amount/currency/product/user after checkout was created.
    const orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`,
      { headers: { Authorization: basicAuth(keyId, keySecret) } }
    );
    const razorpayOrder = await orderResponse.json();

    if (!orderResponse.ok || !razorpayOrder?.id) {
      return NextResponse.json({ error: "Unable to verify Razorpay order" }, { status: 502 });
    }

    if (
      Number(razorpayOrder.amount) !== Math.round(originalAmount * 100) ||
      String(razorpayOrder.currency).toUpperCase() !== originalCurrency
    ) {
      return NextResponse.json({ error: "Payment amount or currency does not match the Razorpay order" }, { status: 400 });
    }

    if (
      String(razorpayOrder.notes?.user_id || "") !== userId ||
      String(razorpayOrder.notes?.product_id || "") !== productId
    ) {
      return NextResponse.json({ error: "Payment order does not match the authenticated purchase" }, { status: 403 });
    }

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
      { headers: { Authorization: basicAuth(keyId, keySecret) } }
    );
    const payment = await paymentResponse.json();

    if (!paymentResponse.ok || !payment?.id) {
      return NextResponse.json({ error: "Unable to verify payment with Razorpay" }, { status: 502 });
    }

    if (
      String(payment.order_id || "") !== razorpayOrderId ||
      Number(payment.amount) !== Number(razorpayOrder.amount) ||
      String(payment.currency || "").toUpperCase() !== originalCurrency
    ) {
      return NextResponse.json({ error: "Razorpay payment does not match the order" }, { status: 400 });
    }

    const paymentStatus = mapPaymentStatus(String(payment.status || ""));

    const book = await db
      .prepare("SELECT id, title FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1")
      .bind(productId)
      .first<Record<string, any>>();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const existing = await db.prepare(
      "SELECT o.id, o.user_id, o.product_id, o.quantity, o.total_amount, o.currency, o.status, o.order_date, " +
      "p.payment_id, p.original_amount, p.original_currency, p.amount_in_inr, p.payment_method, p.created_at " +
      "FROM orders o LEFT JOIN payments p ON p.order_id = o.id " +
      "WHERE o.razorpay_order_id = ? OR p.payment_id = ? LIMIT 1"
    ).bind(razorpayOrderId, razorpayPaymentId).first<Record<string, any>>();

    const rates = await fetchExchangeRates();
    const amountInINR = convertCurrency(originalAmount, originalCurrency, "INR", rates);
    const now = new Date().toISOString();

    if (!existing) {
      const orderId = crypto.randomUUID();
      const paymentRowId = crypto.randomUUID();

      // INSERT OR IGNORE makes the verification idempotent under concurrent
      // Razorpay callbacks/retries because the schema has unique payment/order ids.
      await db.prepare(
        "INSERT OR IGNORE INTO orders " +
        "(id, user_id, product_id, quantity, total_amount, currency, status, contact_number, email, razorpay_order_id, order_date, created_at, updated_at, shipping_address, display_amount, display_currency) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        orderId,
        userId,
        productId,
        quantity,
        Number(amountInINR),
        "INR",
        paymentStatus,
        profile.mobile || null,
        profile.email || null,
        razorpayOrderId,
        now,
        now,
        now,
        profile.address || null,
        originalAmount,
        originalCurrency
      ).run();

      const storedOrder = await db.prepare(
        "SELECT id, user_id, product_id, status FROM orders WHERE razorpay_order_id = ? LIMIT 1"
      ).bind(razorpayOrderId).first<Record<string, any>>();

      if (!storedOrder || storedOrder.user_id !== userId || storedOrder.product_id !== productId) {
        return NextResponse.json({ error: "Payment order ownership mismatch" }, { status: 409 });
      }

      await db.prepare(
        "INSERT OR IGNORE INTO payments " +
        "(id, order_id, razorpay_order_id, payment_id, signature, status, original_currency, original_amount, amount_in_inr, payment_method, bank, card_network, card_last4, error_code, error_description, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        paymentRowId,
        storedOrder.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus,
        originalCurrency,
        originalAmount,
        Number(amountInINR),
        payment.method || null,
        payment.bank || null,
        payment.card?.network || null,
        payment.card?.last4 || null,
        payment.error_code || null,
        payment.error_description || null,
        now,
        now
      ).run();
    } else {
      if (existing.user_id !== userId || existing.product_id !== productId) {
        return NextResponse.json({ error: "Payment order ownership mismatch" }, { status: 409 });
      }

      // A repeated verification is allowed to move the record to the latest
      // Razorpay state (e.g. pending/authorized -> completed, completed -> refunded).
      await db.prepare(
        "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
      ).bind(paymentStatus, now, existing.id).run();

      await db.prepare(
        "UPDATE payments SET status = ?, payment_method = ?, bank = ?, card_network = ?, card_last4 = ?, error_code = ?, error_description = ?, updated_at = ? WHERE order_id = ?"
      ).bind(
        paymentStatus,
        payment.method || null,
        payment.bank || null,
        payment.card?.network || null,
        payment.card?.last4 || null,
        payment.error_code || null,
        payment.error_description || null,
        now,
        existing.id
      ).run();
    }

    const finalOrder = await db.prepare(
      "SELECT o.id, o.user_id, o.product_id, o.quantity, o.total_amount, o.currency, o.status, o.order_date " +
      "FROM orders o WHERE o.razorpay_order_id = ? LIMIT 1"
    ).bind(razorpayOrderId).first<Record<string, any>>();

    const finalPayment = await db.prepare(
      "SELECT payment_id, original_amount, original_currency, amount_in_inr, payment_method, status, created_at " +
      "FROM payments WHERE razorpay_order_id = ? OR payment_id = ? LIMIT 1"
    ).bind(razorpayOrderId, razorpayPaymentId).first<Record<string, any>>();

    if (!finalOrder || !finalPayment) {
      return NextResponse.json({ error: "Payment record could not be finalized" }, { status: 500 });
    }

    // Email is non-critical to payment completion; a mail outage must not turn
    // a captured Razorpay payment into a failed purchase.
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && paymentStatus === "completed" && !existing) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: "kochimonu@gmail.com",
          subject: "New Sale | Shoppers Ocean",
          html: `<p><strong>New Sale details:</strong></p><p><strong>Email:</strong> ${profile.email ?? ""}</p><p><strong>Book ID:</strong>${productId}</p><p><strong>Book Name:</strong>${book.title ?? ""}</p>`,
        });
      } catch (emailError) {
        console.error("Sale notification email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: existing ? "Payment verification is idempotent; existing payment record updated" : "Order created and payment verified successfully",
      status: paymentStatus,
      orderDetails: finalOrder,
      paymentDetails: {
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        method: payment.method,
        status: paymentStatus,
        created_at: payment.created_at,
      },
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 });
  }
}
