import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getFirebaseUser } from '@/lib/firebase/session';
import { firestore } from '@/lib/firebase/admin';

function getRazorpay() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay server credentials are not configured');
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
    try {
        const user = await getFirebaseUser();
        if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

        const { productId, amount, currency = 'INR', notes } = await req.json();
        if (!productId || typeof productId !== 'string') {
            return NextResponse.json({ error: 'Product is required' }, { status: 400 });
        }
        const requestedAmount = Number(amount);
        if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const bookSnap = await firestore.collection('books').doc(productId).get();
        if (!bookSnap.exists || bookSnap.data()?.is_deleted === true) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: Math.round(requestedAmount * 100),
            currency,
            notes: {
                ...(notes || {}),
                product_id: productId,
                user_id: user.uid,
                original_currency: currency,
                original_amount: requestedAmount,
                base_currency: 'INR',
            },
        });

        return NextResponse.json({ orderId: order.id, amount: requestedAmount, currency, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Unable to create payment order. Please try again.' }, { status: 500 });
    }
}
