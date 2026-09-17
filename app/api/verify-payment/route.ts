import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: Request) {
  try {
    const razorpay = getRazorpayClient();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      original_currency,
      original_amount,
      user_id,
      product_id,
      quantity,
      shipping_address,
      contact_number,
      email,
    } = await req.json();
    const rates = await fetchExchangeRates();
    const amountInINR = convertCurrency(
      original_amount,
      original_currency,
      "INR",
      rates
    );

    // Step 1: Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("Razorpay server credentials are not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Step 2: Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Step 3: Check payment status
    let paymentStatus;
    switch (payment.status) {
      case "captured":
        paymentStatus = "completed";
        break;
      case "authorized":
        paymentStatus = "authorized";
        break;
      case "failed":
        paymentStatus = "failed";
        break;
      case "refunded":
        paymentStatus = "refunded";
        break;
      default:
        paymentStatus = "pending";
    }

    // If payment failed, return error
    if (paymentStatus === "failed") {
      return NextResponse.json(
        {
          error: "Payment failed",
          errorDetails: payment.error_description || "Unknown error",
        },
        { status: 400 }
      );
    }

    // Step 4: Store payment details in Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    // Start a Supabase transaction
    const { data, error } = await supabase.rpc("create_order_and_payment", {
      p_order_details: {
        user_id,
        product_id,
        quantity,
        shipping_address,
        contact_number,
        email,
        status: paymentStatus,
        order_date: new Date().toISOString(),
        total_amount: Number(amountInINR), // Store INR amount
        display_amount: Number(original_amount), // Store display amount
        currency: "INR", // Store base currency
        display_currency: original_currency, // Store display currency
      },
      p_payment_details: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: paymentStatus,
        original_currency,
        original_amount,
        amount_in_inr: Number(amountInINR),
        payment_method: payment.method,
        bank: payment.bank,
        card_network: payment.card?.network,
        card_last4: payment.card?.last4,
        error_code: payment.error_code,
        error_description: payment.error_description,
        created_at: new Date().toISOString(),
      },
    });

    if (error) throw error;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const yourEmail = "kochimonu@gmail.com"; // Replace with your actual email address
    const { data: currentBookDetails } = await supabase
      .from("books")
      .select("*")
      .eq("id", product_id)
      .single();

    await resend.emails.send({
      from: "no-reply@shoppersocean.com", // Sender email
      to: yourEmail, // Send to your own email address
      subject: "New Sale | Shoppers Ocean", // Customize the subject line
      html: `
            <p><strong>New Sale details:</strong></p>
            <p><strong>Email:</strong> ${user?.email}</p>
            <p><strong>Book ID:</strong>${product_id}</p>
             <p><strong>Book Name:</strong>${currentBookDetails?.title}</p>
        `,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order created and payment verified successfully",
      status: paymentStatus,
      orderDetails: data.order,
      paymentDetails: {
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        method: payment.method,
        status: paymentStatus,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}
