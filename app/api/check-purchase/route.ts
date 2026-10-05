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

    if (productId) {
      const order = await db.prepare(
        'SELECT id, created_at, status FROM orders WHERE user_id = ? AND product_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(userId, productId, 'completed').first<{ id: string; created_at: string; status: string }>();

      return NextResponse.json({
        hasPurchased: Boolean(order),
        orderDetails: order ? [{ order_id: order.id, purchase_date: order.created_at, status: order.status }] : [],
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const orders = await db.prepare(
        `SELECT id, product_id, created_at, status FROM orders WHERE user_id = ? AND product_id IN (${placeholders}) AND status = ? ORDER BY created_at DESC`
      ).bind(userId, ...productIds, 'completed').all<{ id: string; product_id: string; created_at: string; status: string }>();

      const result: Record<string, any> = {};
      productIds.forEach((id: string) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
      (orders.results || []).forEach(order => {
        if (order.product_id in result && !result[order.product_id].hasPurchased) {
          result[order.product_id].hasPurchased = true;
          result[order.product_id].orderDetails.push({
            order_id: order.id,
            purchase_date: order.created_at,
            status: order.status
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
