import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { convertCurrency, fetchExchangeRates } from '@/utils/currency';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
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
            email
        } = await req.json();
        const rates = await fetchExchangeRates();
        const amountInINR = convertCurrency(
            original_amount,
            original_currency,
            'INR',
            rates
        );

        // Step 1: Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Step 2: Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        console.log("payment===>", payment)

        // Step 3: Check payment status
        let paymentStatus;
        switch (payment.status) {
            case 'captured':
                paymentStatus = 'completed';
                break;
            case 'authorized':
                paymentStatus = 'authorized';
                break;
            case 'failed':
                paymentStatus = 'failed';
                break;
            case 'refunded':
                paymentStatus = 'refunded';
                break;
            default:
                paymentStatus = 'pending';
        }

        // If payment failed, return error
        if (paymentStatus === 'failed') {
            return NextResponse.json(
                {
                    error: 'Payment failed',
                    errorDetails: payment.error_description || 'Unknown error'
                },
                { status: 400 }
            );
        }

        // Step 4: Fetch exchange rates and convert amount
        // const rates = await fetchExchangeRates();
        // const amountInINR = convertCurrency(
        //     original_amount,
        //     original_currency,
        //     'INR',
        //     rates
        // );

        // Step 5: Store payment details in Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Start a Supabase transaction
        const { data, error } = await supabase.rpc('create_order_and_payment', {
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
                currency: 'INR', // Store base currency
                display_currency: original_currency, // Store display currency
            },
            p_payment_details: {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature,
                status: paymentStatus,
                original_currency,
                original_amount,
                amount_in_inr: Number(payment.amount),
                payment_method: payment.method,
                bank: payment.bank,
                card_network: payment.card?.network,
                card_last4: payment.card?.last4,
                error_code: payment.error_code,
                error_description: payment.error_description,
                created_at: new Date().toISOString()
            }
        });

        if (error) throw error;

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Order created and payment verified successfully',
            status: paymentStatus,
            orderDetails: data.order,
            paymentDetails: {
                amount: Number(payment.amount) / 100,
                currency: payment.currency,
                method: payment.method,
                status: paymentStatus,
                created_at: payment.created_at
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Error verifying payment' },
            { status: 500 }
        );
    }
}