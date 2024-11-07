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

        // Fetch current exchange rates
        const rates = await fetchExchangeRates();

        // Convert amount to INR for storage
        const amountInINR = convertCurrency(amount, currency, 'INR', rates);

        // Create order with the converted amount
        const order = await razorpay.orders.create({
            amount: Math.round(amountInINR * 100), // Razorpay expects amount in paise
            currency: 'INR', // Always create order in INR
            notes: {
                ...notes,
                original_currency: currency,
                original_amount: amount,
                exchange_rate: rates[currency],
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amountInINR,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}