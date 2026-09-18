import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { fetchExchangeRates, convertCurrency } from '@/utils/currency';

function getRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay server credentials are not configured');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}

export async function POST(req: Request) {
    try {
        const razorpay = getRazorpay();
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
            { error: 'Unable to create payment order. Please try again.' },
            { status: 500 }
        );
    }
}