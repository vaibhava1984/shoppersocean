import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { fetchExchangeRates, convertCurrency } from '@/utils/currency';

console.log("hai 1===>", process.env.RAZORPAY_KEY_ID)
console.log("hai 2===>", process.env.RAZORPAY_KEY_SECRET)

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
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