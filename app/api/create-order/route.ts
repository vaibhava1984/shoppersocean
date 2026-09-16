import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('Razorpay server credentials are not configured.');
            return NextResponse.json(
                { error: 'Payment service is not configured' },
                { status: 503 }
            );
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const { amount, currency = 'INR', notes } = await req.json();

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency,
            notes: {
                ...notes,
                original_currency: currency,
                original_amount: amount,
                base_currency: 'INR'
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount,
            currency
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}
