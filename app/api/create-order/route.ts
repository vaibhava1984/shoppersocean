import { NextResponse } from "next/server";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay server credentials are not configured");
  }

  return { keyId, keySecret };
}

export async function POST(req: Request) {
  try {
    const { keyId, keySecret } = getCredentials();
    const body = await req.json();

    const amount = Number(body?.amount);
    const currency = String(body?.currency || "INR").toUpperCase();
    const notes = body?.notes && typeof body.notes === "object" ? body.notes : {};

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json(
        { error: "Invalid payment currency" },
        { status: 400 }
      );
    }

    const amountInSubunits = Math.round(amount * 100);
    if (amountInSubunits < 100) {
      return NextResponse.json(
        { error: "Payment amount is below Razorpay's minimum order amount" },
        { status: 400 }
      );
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency,
        notes: {
          ...notes,
          original_currency: currency,
          original_amount: amount,
          base_currency: "INR",
        },
      }),
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok || !razorpayData?.id) {
      console.error("Razorpay order creation failed:", {
        status: razorpayResponse.status,
        error: razorpayData?.error,
      });

      return NextResponse.json(
        {
          error:
            razorpayData?.error?.description ||
            "Unable to create payment order. Please try again.",
        },
        { status: razorpayResponse.status || 502 }
      );
    }

    return NextResponse.json({
      orderId: razorpayData.id,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    return NextResponse.json(
      { error: "Unable to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
