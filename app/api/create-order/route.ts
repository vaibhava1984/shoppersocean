import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { fetchExchangeRates, convertCurrency } from '@/utils/currency';

function getRazorpayClient() {
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
        const razorpay = getRazorpayClient();
        const { amount, currency = 'INR', notes } = await req.json();

        // Create order in the user's local currency
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: currency, // Use the local currency directly
            notes: {
                ...notes,
                original_currency: currency,
                original_amount: amount,
                base_currency: 'INR'
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: amount,
            currency: currency
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}
