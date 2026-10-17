import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensurePaypalSchema } from "@/utils/paypal";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendSaleNotification } from "@/utils/email/sendSaleNotification";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const PRICE_USD = 3;

async function getConfig() {
  const { env } = await getCloudflareContext();
  const clientId = String((env as any).CASHFREE_CLIENT_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
  const clientSecret = String((env as any).CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET || "").trim();
  const mode = String((env as any).CASHFREE_ENV || process.env.CASHFREE_ENV || "production").toLowerCase() === "sandbox" ? "sandbox" : "production";
  if (!clientId || !clientSecret) throw new Error("Cashfree international checkout is not configured yet.");
  return { clientId, clientSecret, mode, base: mode === "sandbox" ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg" };
}
async function ensureSchema(db: any) {
  await ensurePaypalSchema(db);
  for (const sql of [
    "ALTER TABLE orders ADD COLUMN cashfree_order_id TEXT",
    "ALTER TABLE payments ADD COLUMN cashfree_order_id TEXT",
    "ALTER TABLE payments ADD COLUMN cashfree_payment_id TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_cashfree_order_id ON orders(cashfree_order_id) WHERE cashfree_order_id IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_cashfree_order_id ON payments(cashfree_order_id) WHERE cashfree_order_id IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_cashfree_payment_id ON payments(cashfree_payment_id) WHERE cashfree_payment_id IS NOT NULL"
  ]) {
    try { await db.prepare(sql).run(); }
    catch (e) { const m = String(e).toLowerCase(); if (!m.includes("duplicate column") && !m.includes("already exists")) throw e; }
  }
}
function apiHeaders(c: Awaited<ReturnType<typeof getConfig>>) {
  return { "x-client-id": c.clientId, "x-client-secret": c.clientSecret, "x-api-version": "2025-01-01", "Content-Type": "application/json", Accept: "application/json" };
}

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 503 });
    await ensureSchema(db);
    const c = await getConfig();

    if (body.action === "verify") {
      const orderId = String(body.orderId || "").trim();
      if (!orderId) return NextResponse.json({ error: "Cashfree order is required" }, { status: 400 });
      const saved = await db.prepare("SELECT id, user_id, book_id, amount, status FROM orders WHERE cashfree_order_id = ? AND user_id = ? LIMIT 1").bind(orderId, identity.profile.id).first<Record<string, any>>();
      if (!saved) return NextResponse.json({ error: "Cashfree order does not match this account" }, { status: 403 });
      if (String(saved.status).toLowerCase() === "completed") return NextResponse.json({ success: true, status: "completed", productId: String(saved.book_id) });
      const [or, pr] = await Promise.all([
        fetch(`${c.base}/orders/${encodeURIComponent(orderId)}`, { headers: apiHeaders(c), cache: "no-store" }),
        fetch(`${c.base}/orders/${encodeURIComponent(orderId)}/payments`, { headers: apiHeaders(c), cache: "no-store" })
      ]);
      const order = await or.json().catch(() => ({})) as Record<string, any>;
      const payments = await pr.json().catch(() => []) as any;
      const payment = Array.isArray(payments) ? payments.find((p: any) => String(p?.payment_status).toUpperCase() === "SUCCESS") : null;
      if (!or.ok || !pr.ok || String(order.order_status).toUpperCase() !== "PAID" || String(order.order_currency).toUpperCase() !== "USD" || Math.abs(Number(order.order_amount) - PRICE_USD) > 0.001 || !payment) {
        return NextResponse.json({ error: "Cashfree has not confirmed the payment yet. If your bank shows a charge, retry verification before paying again." }, { status: 409 });
      }
      const book = await db.prepare("SELECT id, title FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1").bind(saved.book_id).first<Record<string, any>>();
      if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
      const paymentId = String(payment.cf_payment_id || payment.payment_id || "");
      if (!paymentId) return NextResponse.json({ error: "Cashfree payment reference is missing" }, { status: 409 });
      const duplicate = await db.prepare("SELECT id, order_id, user_id, book_id FROM payments WHERE cashfree_order_id = ? OR cashfree_payment_id = ? LIMIT 1").bind(orderId, paymentId).first<Record<string, any>>();
      if (duplicate && (String(duplicate.order_id) !== String(saved.id) || String(duplicate.user_id) !== identity.profile.id || String(duplicate.book_id) !== String(saved.book_id))) return NextResponse.json({ error: "Conflicting Cashfree payment record" }, { status: 409 });
      const now = new Date().toISOString();
      if (!duplicate) {
        await db.prepare("INSERT INTO payments (id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, paypal_order_id, paypal_capture_id, cashfree_order_id, cashfree_payment_id, original_amount, original_currency, payment_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'INR', 'completed', NULL, NULL, NULL, NULL, ?, ?, ?, 'USD', 'Cashfree', ?, ?)")
          .bind(crypto.randomUUID(), saved.id, identity.profile.id, saved.book_id, Number(saved.amount), orderId, paymentId, Number(payment.payment_amount || PRICE_USD), now, now).run();
      }
      await db.prepare("UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ? AND user_id = ?").bind(now, saved.id, identity.profile.id).run();
      try {
        const profile = await db.prepare("SELECT email FROM users WHERE id = ? LIMIT 1").bind(identity.profile.id).first<Record<string, any>>();
        await sendSaleNotification({ paymentId, paymentMethod: "Cashfree", customerEmail: String(identity.profile.email || profile?.email || ""), bookId: String(saved.book_id), bookTitle: String(book.title || "") });
      } catch (e) { console.error("Cashfree sale email failed:", e); }
      return NextResponse.json({ success: true, status: "completed", productId: String(saved.book_id) }, { headers: { "Cache-Control": "no-store" } });
    }

    const country = String(identity.profile.country || "").trim().toUpperCase();
    if (country === "IN" || country === "INDIA") return NextResponse.json({ error: "Customers in India must use Razorpay." }, { status: 400 });
    const productId = String(body.productId || "").trim();
    if (!productId) return NextResponse.json({ error: "Book is required" }, { status: 400 });
    const book = await db.prepare("SELECT id, title, price FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1").bind(productId).first<Record<string, any>>();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    const priceInINR = Number(book.price);
    if (!Number.isFinite(priceInINR) || priceInINR <= 0) return NextResponse.json({ error: "This book does not have a valid price" }, { status: 400 });
    const profile = await db.prepare("SELECT email, phone FROM users WHERE id = ? LIMIT 1").bind(identity.profile.id).first<Record<string, any>>();
    const email = String(identity.profile.email || profile?.email || "").trim();
    const phone = String(identity.profile.phone || profile?.phone || body.phone || "").replace(/\D/g, "");
    if (!email) return NextResponse.json({ error: "A valid email address is required for card checkout." }, { status: 400 });
    if (phone.length < 10) return NextResponse.json({ error: "Enter a phone number with at least 10 digits to continue." }, { status: 400 });
    const orderId = `so_cf_${crypto.randomUUID().replace(/-/g, "")}`;
    const response = await fetch(`${c.base}/orders`, {
      method: "POST", headers: apiHeaders(c),
      body: JSON.stringify({
        order_id: orderId, order_amount: PRICE_USD, order_currency: "USD",
        customer_details: { customer_id: String(identity.profile.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) || crypto.randomUUID(), customer_email: email, customer_phone: phone.slice(-10) },
        order_meta: { return_url: "https://www.shoppersocean.com/payment/cashfree/return?order_id={order_id}" },
        order_note: String(book.title || "Shoppers Ocean eBook").slice(0, 250)
      }), cache: "no-store"
    });
    const result = await response.json().catch(() => ({})) as Record<string, any>;
    if (!response.ok || !result.payment_session_id) {
      console.error("Cashfree order creation failed:", response.status, result?.type, result?.code);
      return NextResponse.json({ error: "Cashfree could not prepare checkout. Confirm international payments are enabled on your Cashfree account." }, { status: 502 });
    }
    const now = new Date().toISOString();
    try {
      await db.prepare("INSERT INTO orders (id, user_id, book_id, amount, currency, status, cashfree_order_id, created_at, updated_at) VALUES (?, ?, ?, ?, 'INR', 'pending', ?, ?, ?)")
        .bind(crypto.randomUUID(), identity.profile.id, productId, priceInINR, orderId, now, now).run();
    } catch (e) {
      console.error("Could not save pending Cashfree order:", e);
      return NextResponse.json({ error: "We could not safely prepare your purchase. You have not been charged; please try again." }, { status: 503 });
    }
    return NextResponse.json({ orderId, paymentSessionId: String(result.payment_session_id), mode: c.mode }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cashfree checkout error:", error);
    const message = error instanceof Error && error.message.includes("not configured") ? error.message : "Cashfree checkout is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: message.includes("not configured") ? 503 : 500, headers: { "Cache-Control": "no-store" } });
  }
}
