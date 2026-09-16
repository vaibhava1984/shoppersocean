import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay server credentials are not configured.");
      return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, original_currency, original_amount, user_id, product_id, quantity, shipping_address, contact_number, email } = await req.json();
    if (!user_id || user_id !== user.id) return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !product_id) return NextResponse.json({ error: "Missing payment details" }, { status: 400 });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    if (expectedSignature !== razorpay_signature) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    let paymentStatus: string;
    switch (payment.status) {
      case "captured": paymentStatus = "completed"; break;
      case "authorized": paymentStatus = "authorized"; break;
      case "failed": paymentStatus = "failed"; break;
      case "refunded": paymentStatus = "refunded"; break;
      default: paymentStatus = "pending";
    }
    if (paymentStatus === "failed") return NextResponse.json({ error: "Payment failed", errorDetails: payment.error_description || "Unknown error" }, { status: 400 });

    const rates = await fetchExchangeRates();
    const amountInINR = convertCurrency(original_amount, original_currency, "INR", rates);
    const { data, error } = await supabase.rpc("create_order_and_payment", {
      p_order_details: {
        user_id, product_id, quantity, shipping_address, contact_number, email,
        status: paymentStatus, order_date: new Date().toISOString(),
        total_amount: Number(amountInINR), display_amount: Number(original_amount),
        currency: "INR", display_currency: original_currency,
      },
      p_payment_details: {
        order_id: razorpay_order_id, payment_id: razorpay_payment_id, signature: razorpay_signature,
        status: paymentStatus, original_currency, original_amount, amount_in_inr: Number(amountInINR),
        payment_method: payment.method, bank: payment.bank, card_network: payment.card?.network,
        card_last4: payment.card?.last4, error_code: payment.error_code,
        error_description: payment.error_description, created_at: new Date().toISOString(),
      },
    });
    if (error) throw error;

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data: currentBookDetails } = await supabase.from("books").select("title").eq("id", product_id).single();
      await resend.emails.send({
        from: "no-reply@shoppersocean.com", to: "kochimonu@gmail.com", subject: "New Sale | Shoppers Ocean",
        html: `<p><strong>New Sale details:</strong></p><p><strong>Email:</strong> ${user.email}</p><p><strong>Book ID:</strong>${product_id}</p><p><strong>Book Name:</strong>${currentBookDetails?.title || ''}</p>`,
      });
    } catch (emailError) {
      console.error("Sale notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true, message: "Order created and payment verified successfully", status: paymentStatus,
      orderDetails: data.order,
      paymentDetails: { amount: Number(payment.amount) / 100, currency: payment.currency, method: payment.method, status: paymentStatus, created_at: payment.created_at },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 });
  }
}
