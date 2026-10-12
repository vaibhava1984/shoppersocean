import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// One-time recovery for the captured payment reported on 12 Oct 2026.
// This endpoint accepts no payment ID from the caller and is admin-only.
const PAYMENT_ID = "pay_TmztPjJIcE0AzY";
const USER_ID = "78bd508b-3f89-430a-ad41-b644343dae54";
const BOOK_ID = "42626c37-7ed1-491a-9429-2f1e6342e97c";
const EXPECTED_AMOUNT_PAISE = 10000;
const EXPECTED_CURRENCY = "INR";

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char] as string));
}

export async function POST() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 403 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay server credentials are not configured" }, { status: 500 });
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 500 });
    }

    // Trust only Razorpay's authenticated server-to-server response, not the browser or dashboard claim.
    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(PAYMENT_ID)}`,
      { headers: { Authorization: basicAuth(keyId, keySecret) }, cache: "no-store" }
    );
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || payment?.id !== PAYMENT_ID) {
      console.error("Razorpay recovery could not fetch payment", paymentResponse.status);
      return NextResponse.json({ error: "Razorpay could not verify this payment" }, { status: 502 });
    }

    if (payment.status !== "captured" || payment.captured !== true) {
      return NextResponse.json({ error: "Payment is not captured; no database changes were made" }, { status: 409 });
    }
    if (Number(payment.amount) !== EXPECTED_AMOUNT_PAISE ||
        String(payment.currency || "").toUpperCase() !== EXPECTED_CURRENCY) {
      return NextResponse.json({ error: "Captured payment amount/currency did not match the expected ₹100 purchase; no changes made" }, { status: 409 });
    }

    const razorpayOrderId = String(payment.order_id || "");
    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Payment has no linked Razorpay order; no changes made" }, { status: 409 });
    }

    const orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`,
      { headers: { Authorization: basicAuth(keyId, keySecret) }, cache: "no-store" }
    );
    const razorpayOrder = await orderResponse.json();
    if (!orderResponse.ok || razorpayOrder?.id !== razorpayOrderId) {
      return NextResponse.json({ error: "Could not verify the linked Razorpay order; no changes made" }, { status: 502 });
    }
    if (Number(razorpayOrder.amount) !== EXPECTED_AMOUNT_PAISE ||
        String(razorpayOrder.currency || "").toUpperCase() !== EXPECTED_CURRENCY ||
        String(razorpayOrder.notes?.user_id || "") !== USER_ID ||
        String(razorpayOrder.notes?.product_id || "") !== BOOK_ID) {
      return NextResponse.json({ error: "Razorpay order ownership, book, amount, or currency did not match; no changes made" }, { status: 409 });
    }

    const [profile, book] = await Promise.all([
      db.prepare("SELECT id, email FROM users WHERE id = ? LIMIT 1").bind(USER_ID).first<Record<string, any>>(),
      db.prepare("SELECT id, title, price FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1").bind(BOOK_ID).first<Record<string, any>>(),
    ]);
    if (!profile || !book || Number(book.price) !== 100) {
      return NextResponse.json({ error: "The expected customer or ₹100 book could not be confirmed; no changes made" }, { status: 409 });
    }

    const existing = await db.prepare(
      "SELECT o.id, o.user_id, o.book_id, o.status, o.razorpay_order_id, p.razorpay_payment_id " +
      "FROM orders o LEFT JOIN payments p ON p.order_id = o.id " +
      "WHERE o.razorpay_order_id = ? OR p.razorpay_payment_id = ? LIMIT 1"
    ).bind(razorpayOrderId, PAYMENT_ID).first<Record<string, any>>();

    if (existing && (String(existing.user_id) !== USER_ID || String(existing.book_id) !== BOOK_ID)) {
      return NextResponse.json({ error: "A conflicting database record exists; no changes made" }, { status: 409 });
    }

    const now = new Date().toISOString();
    let orderRowId = existing ? String(existing.id) : crypto.randomUUID();
    let createdNewPurchase = !existing;

    if (!existing) {
      await db.prepare(
        "INSERT INTO orders (id, user_id, book_id, amount, currency, status, razorpay_order_id, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?)"
      ).bind(orderRowId, USER_ID, BOOK_ID, 100, "INR", razorpayOrderId, now, now).run();
    } else {
      await db.prepare("UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?")
        .bind(now, orderRowId).run();
    }

    const existingPayment = await db.prepare(
      "SELECT id, order_id, user_id, book_id FROM payments WHERE razorpay_payment_id = ? OR razorpay_order_id = ? LIMIT 1"
    ).bind(PAYMENT_ID, razorpayOrderId).first<Record<string, any>>();

    if (existingPayment && (String(existingPayment.user_id) !== USER_ID ||
        String(existingPayment.book_id) !== BOOK_ID || String(existingPayment.order_id) !== orderRowId)) {
      return NextResponse.json({ error: "A conflicting payment record exists; please review before further changes" }, { status: 409 });
    }

    if (!existingPayment) {
      await db.prepare(
        "INSERT INTO payments (id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), orderRowId, USER_ID, BOOK_ID, 100, "INR", PAYMENT_ID, razorpayOrderId, now, now).run();
    } else {
      await db.prepare("UPDATE payments SET status = 'completed', updated_at = ? WHERE id = ?")
        .bind(now, String(existingPayment.id)).run();
    }

    let notification = "not_needed";
    if (createdNewPurchase) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        notification = "missing_resend_api_key";
      } else {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "no-reply@shoppersocean.com",
            to: ["kochimonu@gmail.com"],
            subject: "New Sale | Shoppers Ocean",
            html: `<p><strong>New Sale details:</strong></p><p><strong>Customer email:</strong> ${escapeHtml(profile.email)}</p><p><strong>Book:</strong> ${escapeHtml(book.title)}</p><p><strong>Amount:</strong> ₹100</p><p><strong>Razorpay payment ID:</strong> ${PAYMENT_ID}</p>`,
          }),
        });
        if (emailResponse.ok) {
          notification = "sent";
        } else {
          const errorBody = await emailResponse.text();
          console.error("Recovery sale email failed", emailResponse.status, errorBody.slice(0, 500));
          notification = "failed";
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: "completed",
      customer: profile.email,
      book: book.title,
      amount: 100,
      currency: "INR",
      purchase: createdNewPurchase ? "recovered" : "already_recorded_and_reconciled",
      notification,
      message: "Razorpay payment was verified server-side and the purchase is now recorded.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Captured payment recovery failed", error);
    return NextResponse.json({ error: "Payment recovery failed; please inspect server logs" }, { status: 500 });
  }
}
