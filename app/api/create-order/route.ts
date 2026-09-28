import { NextResponse } from 'next/server';

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay server credentials are not configured');
  return { keyId, keySecret };
}

export async function POST(req: Request) {
  try {
    const { keyId, keySecret } = getRazorpayCredentials();
    const { amount, currency = 'INR', notes } = await req.json();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || currency !== 'INR') {
      return NextResponse.json({ error: 'Invalid purchase amount or currency.' }, { status: 400 });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(numericAmount * 100),
        currency: 'INR',
        notes: {
          ...(notes ?? {}),
          original_currency: currency,
          original_amount: numericAmount,
          base_currency: 'INR',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.id) {
      console.error('Razorpay order creation failed:', response.status, data);
      return NextResponse.json(
        { error: 'Unable to create payment order. Please try again.' },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 }
      );
    }

    return NextResponse.json({
      orderId: data.id,
      amount: numericAmount,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Unable to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}