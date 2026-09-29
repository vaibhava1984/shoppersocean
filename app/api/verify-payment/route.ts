import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

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
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(orderId + "|" + paymentId)
  );
  return timingSafeEqual(hex(digest), signature);
}

async function fetchRazorpayPayment(paymentId: string, keyId: string, keySecret: string) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      Accept: "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok || !data?.id) {
    throw new Error("Unable to retrieve Razorpay payment");
  }
  return data;
}

export async function POST(req: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.DB;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay server credentials are not configured");
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      original_currency = "INR",
      original_amount,
      user_id,
      product_id,
      quantity = 1,
      shipping_address,
      contact_number,
      email,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !product_id) {
      return NextResponse.json({ error: "Missing payment verification details" }, { status: 400 });
    }

    const signatureValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );
    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const payment = await fetchRazorpayPayment(razorpay_payment_id, keyId, keySecret);

    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Payment/order mismatch" }, { status: 400 });
    }

    const rates = await fetchExchangeRates();
    const amountInINR = convertCurrency(
      Number(original_amount),
      String(original_currency),
      "INR",
      rates
    );

    const paymentStatus =
      payment.status === "captured" ? "completed" :
      payment.status === "authorized" ? "authorized" :
      payment.status === "failed" ? "failed" :
      payment.status === "refunded" ? "refunded" : "pending";

    if (paymentStatus === "failed" || paymentStatus === "refunded") {
      return NextResponse.json({
        success: false,
        status: paymentStatus,
        error: paymentStatus === "failed" ? "Payment failed" : "Payment refunded",
        errorDetails: payment.error_description || undefined,
      }, { status: paymentStatus === "failed" ? 400 : 409 });
    }

    const existing = await db.prepare(
      "SELECT id, status FROM payments WHERE payment_id = ? LIMIT 1"
    ).bind(razorpay_payment_id).first<{ id: string; status: string }>();

    if (existing) {
      return NextResponse.json({
        success: true,
        status: existing.status,
        message: "Payment already verified",
      });
    }

    const order = await db.prepare(
      `INSERT INTO orders
        (user_id, product_id, quantity, shipping_address, contact_number, email,
         status, order_date, total_amount, display_amount, currency, display_currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`
    ).bind(
      user_id,
      product_id,
      Number(quantity),
      shipping_address ?? null,
      contact_number ?? null,
      email ?? null,
      paymentStatus,
      new Date().toISOString(),
      Number(amountInINR),
      Number(original_amount),
      "INR",
      String(original_currency)
    ).first<{ id: string }>();

    if (!order?.id) throw new Error("Unable to create order record");

    await db.prepare(
      `INSERT OR IGNORE INTO payments
        (order_id, payment_id, signature, status, original_currency, original_amount,
         amount_in_inr, payment_method, bank, card_network, card_last4,
         error_code, error_description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      order.id,
      razorpay_payment_id,
      razorpay_signature,
      paymentStatus,
      String(original_currency),
      Number(original_amount),
      Number(amountInINR),
      payment.method ?? null,
      payment.bank ?? null,
      payment.card?.network ?? null,
      payment.card?.last4 ?? null,
      payment.error_code ?? null,
      payment.error_description ?? null,
      new Date().toISOString()
    ).run();

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: "kochimonu@gmail.com",
          subject: "New Sale | Shoppers Ocean",
          html: `<p><strong>New Sale details:</strong></p>
                 <p><strong>Email:</strong> ${email ?? ""}</p>
                 <p><strong>Book ID:</strong> ${product_id}</p>
                 <p><strong>Razorpay Payment ID:</strong> ${razorpay_payment_id}</p>
                 <p><strong>Status:</strong> ${paymentStatus}</p>`,
        });
      } catch (emailError) {
        console.error("Sale email failed after successful payment:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      status: paymentStatus,
      orderDetails: order,
      paymentDetails: {
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        method: payment.method,
        status: paymentStatus,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}