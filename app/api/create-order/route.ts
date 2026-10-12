import { NextResponse } from 'next/server';
import { requireUser } from '@/utils/auth/requireUser';
import { getD1 } from '@/utils/cloudflare/d1';
import { convertCurrency, isIndiaCountry } from '@/utils/currency';
import { getExchangeRatesWithFallback } from '@/utils/serverExchangeRates';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function basicAuth(keyId: string, keySecret: string) {
    return 'Basic ' + btoa(keyId + ':' + keySecret);
}

export async function POST(req: Request) {
    try {
        const identity = await requireUser();
        if (!identity) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            return NextResponse.json({ error: 'Razorpay server credentials are not configured' }, { status: 500 });
        }

        const db = getD1();
        if (!db) {
            return NextResponse.json({ error: 'Cloudflare D1 is not available' }, { status: 500 });
        }

        const body = await req.json();
        const productId = String(body?.productId || '');
        // Currency is determined by the authenticated account, never by browser input.
        const requestedCurrency = isIndiaCountry(identity.profile.country) ? 'INR' : 'USD';

        if (!productId) {
            return NextResponse.json({ error: 'Book is required' }, { status: 400 });
        }

        const book = await db.prepare(
            'SELECT id, title, price FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1'
        ).bind(productId).first<Record<string, any>>();

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const priceInINR = Number(book.price);
        if (!Number.isFinite(priceInINR) || priceInINR <= 0) {
            return NextResponse.json({ error: 'This book does not have a valid price' }, { status: 400 });
        }

        const amount = requestedCurrency === 'INR'
            ? priceInINR
            : convertCurrency(priceInINR, 'INR', 'USD', (await getExchangeRatesWithFallback()).rates);

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Unable to calculate the payment amount' }, { status: 400 });
        }

        const receipt = `so_${crypto.randomUUID().replace(/-/g, '').slice(0, 30)}`;
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: basicAuth(keyId, keySecret),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency: requestedCurrency,
                receipt,
                notes: {
                    user_id: identity.profile.id,
                    product_id: productId,
                    product_title: String(book.title || ''),
                    original_currency: requestedCurrency,
                    original_amount: amount,
                    base_currency: 'INR',
                    base_amount: priceInINR,
                },
            }),
        });

        const order = await orderResponse.json();
        if (!orderResponse.ok || !order?.id) {
            console.error('Razorpay order creation failed:', order);
            return NextResponse.json(
                { error: 'Unable to create payment order. Please try again.' },
                { status: 502 }
            );
        }

        // Persist the pending purchase BEFORE returning the Razorpay order to the browser.
        // If D1 cannot record it, do not expose the order for checkout; otherwise a captured
        // payment could exist at Razorpay without any local purchase record.
        const now = new Date().toISOString();
        const localOrderId = crypto.randomUUID();
        try {
            await db.prepare(
                'INSERT INTO orders (id, user_id, book_id, amount, currency, status, razorpay_order_id, created_at, updated_at) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                localOrderId,
                identity.profile.id,
                productId,
                priceInINR,
                'INR',
                'pending',
                String(order.id),
                now,
                now
            ).run();
        } catch (dbError) {
            console.error('Unable to persist pending purchase before checkout:', dbError);
            return NextResponse.json(
                { error: 'We could not safely prepare your purchase. You have not been asked to pay; please try again.' },
                { status: 503, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        return NextResponse.json({
            orderId: order.id,
            amount,
            currency: requestedCurrency,
        }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Unable to create payment order. Please try again.' },
            { status: 500 }
        );
    }
}
