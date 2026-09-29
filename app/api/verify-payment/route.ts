import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile";
import { getD1 } from "@/utils/cloudflare/d1";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay server credentials are not configured");
  return { keyId, keySecret };
}

function toHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createSignature(orderId: string, paymentId: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(orderId + "|" + paymentId)
  );
  return toHex(signature);
}

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}


export async function POST(req: Request) {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const { keyId, keySecret } = getCredentials();
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      original_currency, original_amount, product_id, quantity,
      shipping_address, contact_number, email,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !product_id) {
      return NextResponse.json({ error: "Required payment information is missing" }, { status: 400 });
    }

    const expectedSignature = await createSignature(razorpay_order_id, razorpay_payment_id, keySecret);

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {\n      headers: { Authorization: basicAuth(keyId, keySecret) },\n    });\n    const payment = await paymentResponse.json();\n    if (!paymentResponse.ok || !payment?.id) {\n      return NextResponse.json({ error: "Unable to verify payment with Razorpay" }, { status: 502 });\n    }
    let paymentStatus: string;
    switch (payment.status) {
      case "captured": paymentStatus = "completed"; break;
      case "authorized": paymentStatus = "authorized"; break;
      case "failed": paymentStatus = "failed"; break;
      case "refunded": paymentStatus = "refunded"; break;
      default: paymentStatus = "pending";
    }

    if (paymentStatus === "failed") {
      return NextResponse.json({
        error: "Payment failed",
        errorDetails: payment.error_description || "Unknown error"
      }, { status: 400 });
    }

    const existing = await db.prepare(
      "SELECT o.id, o.product_id, o.status, p.payment_id, p.original_amount, p.original_currency, p.amount_in_inr, p.payment_method, p.created_at " +
      "FROM orders o LEFT JOIN payments p ON p.order_id = o.id " +
      "WHERE o.razorpay_order_id = ? OR p.payment_id = ? LIMIT 1"
    ).bind(razorpay_order_id, razorpay_payment_id).first<Record<string, any>>();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        status: existing.status,
        orderDetails: existing,
        paymentDetails: {
          amount: Number(payment.amount) / 100,
          currency: payment.currency,
          method: payment.method,
          status: existing.status,
          created_at: payment.created_at
        }
      });
    }

    const rates = await fetchExchangeRates();
    const amountInINR = convertCurrency(Number(original_amount), original_currency, "INR", rates);
    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const paymentRowId = crypto.randomUUID();

    const book = await db.prepare(
      "SELECT id, title FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(product_id).first<Record<string, any>>();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    await db.prepare(
      "INSERT INTO orders (id, user_id, product_id, quantity, total_amount, currency, status, contact_number, email, razorpay_order_id, order_date, created_at, updated_at, shipping_address, display_amount, display_currency) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      orderId, identity.profile.id, product_id, Number(quantity || 1), Number(amountInINR), "INR",
      paymentStatus, contact_number || identity.profile.mobile || null, email || identity.profile.email,
      razorpay_order_id, now, now, now, shipping_address || identity.profile.address || null,
      Number(original_amount), original_currency
    ).run();

    try {
      await db.prepare(
        "INSERT INTO payments (id, order_id, razorpay_order_id, payment_id, signature, status, original_currency, original_amount, amount_in_inr, payment_method, bank, card_network, card_last4, error_code, error_description, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        paymentRowId, orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentStatus,
        original_currency, Number(original_amount), Number(amountInINR), payment.method || null,
        payment.bank || null, payment.card?.network || null, payment.card?.last4 || null,
        payment.error_code || null, payment.error_description || null, now, now
      ).run();
    } catch (error) {
      await db.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
      throw error;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: "kochimonu@gmail.com",
        subject: "New Sale | Shoppers Ocean",
        html: `<p><strong>New Sale details:</strong></p><p><strong>Email:</strong> ${identity.profile.email ?? email ?? ""}</p><p><strong>Book ID:</strong>${product_id}</p><p><strong>Book Name:</strong>${book.title ?? ""}</p>`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order created and payment verified successfully",
      status: paymentStatus,
      orderDetails: { id: orderId, user_id: identity.profile.id, product_id, quantity: Number(quantity || 1), total_amount: Number(amountInINR), currency: "INR", status: paymentStatus, order_date: now },
      paymentDetails: {
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        method: payment.method,
        status: paymentStatus,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 });
  }
}
