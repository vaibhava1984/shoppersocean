import { NextResponse } from 'next/server';
import { requireUser } from '@/utils/auth/requireUser';
import { getD1 } from '@/utils/cloudflare/d1';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json(
        { error: 'Cloudflare D1 is not available' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const userId = identity.profile.id;
    const body = await req.json();
    const { productId, productIds } = body;

    // The production D1 schema stores the book reference as book_id.
    // productId is retained at the API boundary because that is what the UI calls it.
    if (productId) {
      const order = await db.prepare(
        "SELECT o.id, o.created_at, CASE WHEN o.status = 'completed' OR p.status = 'completed' THEN 'completed' ELSE o.status END AS status FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE o.user_id = ? AND o.book_id = ? AND (o.status = 'completed' OR p.status = 'completed') ORDER BY o.created_at DESC LIMIT 1"
      ).bind(userId, String(productId)).first<{ id: string; created_at: string; status: string }>();

      return NextResponse.json({
        hasPurchased: Boolean(order),
        orderDetails: order ? [{ order_id: order.id, purchase_date: order.created_at, status: order.status }] : [],
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      const ids = productIds.map((id: unknown) => String(id));
      const placeholders = ids.map(() => '?').join(',');
      const orders = await db.prepare(
        `SELECT o.id, o.book_id, o.created_at,
                CASE WHEN o.status = 'completed' OR p.status = 'completed' THEN 'completed' ELSE o.status END AS status
         FROM orders o
         LEFT JOIN payments p ON p.order_id = o.id
         WHERE o.user_id = ? AND o.book_id IN (${placeholders})
           AND (o.status = 'completed' OR p.status = 'completed')
         ORDER BY o.created_at DESC`
      ).bind(userId, ...ids).all<{ id: string; book_id: string; created_at: string; status: string }>();

      const result: Record<string, any> = {};
      ids.forEach((id) => { result[id] = { hasPurchased: false, orderDetails: [] }; });

      (orders.results || []).forEach((order) => {
        const bookId = String(order.book_id);
        if (bookId in result && !result[bookId].hasPurchased) {
          result[bookId].hasPurchased = true;
          result[bookId].orderDetails.push({
            order_id: order.id,
            purchase_date: order.created_at,
            status: order.status,
          });
        }
      });

      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json(
      { error: 'Product ID or Product IDs are required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json(
      { error: 'Error checking purchase' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
