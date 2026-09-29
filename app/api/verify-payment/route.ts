import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/utils/auth/server";
import { Resend } from "resend";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(orderId + "|" + paymentId));
  return timingSafeEqual(hex(digest), signature);
}
async function fetchRazorpayPayment(paymentId: string, keyId: string, keySecret: string) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, Accept: "application/json" },
  });
  const data = await response.json();
  if (!response.ok || !data?.id) throw new Error("Unable to retrieve Razorpay payment");
  return data;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;
    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay server credentials are not configured");

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, product_id } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !product_id)
      return NextResponse.json({ error: "Missing payment verification details" }, { status: 400 });

    if (!(await verifySignature(String(razorpay_order_id), String(razorpay_payment_id), String(razorpay_signature), keySecret)))
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    const payment = await fetchRazorpayPayment(String(razorpay_payment_id), keyId, keySecret);
    if (payment.order_id !== razorpay_order_id)
      return NextResponse.json({ error: "Payment/order mismatch" }, { status: 400 });

    const book = await db.prepare('SELECT id, price, is_deleted FROM books WHERE id = ? LIMIT 1')
      .bind(String(product_id)).first<{ id: string; price: number; is_deleted: number }>();
    if (!book || book.is_deleted) return NextResponse.json({ error: "Book is unavailable" }, { status: 404 });

    const expectedPaise = Math.round(Number(book.price) * 100);
    if (!Number.isFinite(expectedPaise) || expectedPaise <= 0 || Number(payment.amount) !== expectedPaise || payment.currency !== "INR")
      return NextResponse.json({ error: "Payment amount does not match the book price" }, { status: 400 });

    const paymentStatus =
      payment.status === "captured" ? "completed" :
      payment.status === "authorized" ? "authorized" :
      payment.status === "failed" ? "failed" :
      payment.status === "refunded" ? "refunded" : "pending";

    if (paymentStatus === "failed" || paymentStatus === "refunded")
      return NextResponse.json({ success: false, status: paymentStatus, error: paymentStatus === "failed" ? "Payment failed" : "Payment refunded", errorDetails: payment.error_description || undefined }, { status: paymentStatus === "failed" ? 400 : 409 });

    const existing = await db.prepare("SELECT id, status FROM payments WHERE razorpay_payment_id = ? LIMIT 1")
      .bind(String(razorpay_payment_id)).first<{ id: string; status: string }>();
    if (existing) return NextResponse.json({ success: true, status: existing.status, message: "Payment already verified" });

    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();

    await db.prepare(`INSERT INTO orders
      (id, user_id, book_id, amount, currency, status, razorpay_order_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'INR', ?, ?, ?, ?)`)
      .bind(orderId, user.id, String(product_id), Number(book.price), paymentStatus, String(razorpay_order_id), now, now).run();

    await db.prepare(`INSERT INTO payments
      (id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), orderId, user.id, String(product_id), Number(book.price), paymentStatus, String(razorpay_payment_id), String(razorpay_order_id), now, now).run();

    const resendApiKey = env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: "kochimonu@gmail.com",
          subject: "New Sale | Shoppers Ocean",
          html: `<p><strong>New Sale</strong></p><p><strong>Email:</strong> ${user.email}</p><p><strong>Book ID:</strong> ${product_id}</p><p><strong>Razorpay Payment ID:</strong> ${razorpay_payment_id}</p><p><strong>Status:</strong> ${paymentStatus}</p>`,
        });
      } catch (emailError) {
        console.error("Sale email failed after payment:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      status: paymentStatus,
      orderDetails: { id: orderId, user_id: user.id, book_id: String(product_id), amount: Number(book.price), currency: "INR", status: paymentStatus, razorpay_order_id },
      paymentDetails: { amount: Number(payment.amount) / 100, currency: payment.currency, method: payment.method, status: paymentStatus, created_at: payment.created_at },
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 });
  }
}