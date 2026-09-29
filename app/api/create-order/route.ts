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
        const body = await req.json();
        const amount = Number(body.amount);
        const currency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'INR';
        const notes = body.notes && typeof body.notes === 'object' ? body.notes : {};

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
        }
        if (!/^[A-Z]{3}$/.test(currency)) {
            return NextResponse.json({ error: 'Invalid payment currency' }, { status: 400 });
        }

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency,
                notes: {
                    ...notes,
                    original_currency: currency,
                    original_amount: amount,
                    base_currency: 'INR',
                },
            }),
        });

        const razorpayBody = await razorpayResponse.json();
        if (!razorpayResponse.ok || !razorpayBody?.id) {
            console.error('Razorpay order creation failed:', razorpayBody);
            return NextResponse.json(
                { error: 'Unable to create payment order. Please try again.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            orderId: razorpayBody.id,
            amount,
            currency,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Unable to create payment order. Please try again.' },
            { status: 500 }
        );
    }
}