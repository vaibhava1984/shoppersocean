import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionUser } from '@/utils/auth/server';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay server credentials are not configured');

    const body = await req.json();
    const notes = body.notes && typeof body.notes === 'object' ? body.notes : {};
    const productId = typeof notes.product_id === 'string' ? notes.product_id : '';
    if (!productId) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const book = await env.DB.prepare(
      'SELECT id, price, is_deleted, isCompletelyFilled FROM books WHERE id = ? LIMIT 1'
    ).bind(productId).first<{ id: string; price: number; is_deleted: number; isCompletelyFilled: number }>();
    if (!book || book.is_deleted) return NextResponse.json({ error: 'Book is unavailable' }, { status: 404 });

    const amount = Number(book.price);
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Invalid book price' }, { status: 400 });

    const currency = 'INR';
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt: `so_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`,
        notes: { product_id: productId, user_id: user.id },
      }),
    });

    const razorpayBody = await razorpayResponse.json();
    if (!razorpayResponse.ok || !razorpayBody?.id) {
      console.error('Razorpay order creation failed:', razorpayBody);
      return NextResponse.json({ error: 'Unable to create payment order. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ orderId: razorpayBody.id, amount, currency });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Unable to create payment order. Please try again.' }, { status: 500 });
  }
}