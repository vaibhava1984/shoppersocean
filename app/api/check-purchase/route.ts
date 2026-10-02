import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    // âââ Authenticate ââââââââââââââââââââââââââââââââââââââ
    // Try cookie-based session first, then Bearer token (JWT)
    let user = await getCurrentUser(req, db, jwtSecret);

    // Also support Bearer token (for backward compat with client-side fetch)
    if (!user) {
      const authorization = req.headers.get('authorization');
      const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
      if (bearerToken && bearerToken !== 'cookie-auth') {
        const { verifyJwt } = await import('@/lib/auth');
        const payload = await verifyJwt(bearerToken, jwtSecret);
        if (payload) {
          user = await db.prepare('SELECT id, email, full_name, country FROM users WHERE id = ?').bind(payload.sub).first();
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const userId = user.id;
    const body = await req.json();
    const { productId, productIds } = body;

    if (productId) {
      // Single product purchase check
      const order = await db.prepare(
        'SELECT id, created_at, status FROM orders WHERE user_id = ? AND book_id = ? AND status = ?'
      ).bind(userId, productId, 'completed').first<{ id: string; created_at: string; status: string }>();

      return NextResponse.json({
        hasPurchased: Boolean(order),
        orderDetails: order ? [{ order_id: order.id, purchase_date: order.created_at, status: order.status }] : [],
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      // Batch purchase check â build placeholders for IN clause
      const placeholders = productIds.map(() => '?').join(',');
      const orders = await db.prepare(
        `SELECT id, book_id, created_at, status FROM orders WHERE user_id = ? AND book_id IN (${placeholders}) AND status = ?`
      ).bind(userId, ...productIds, 'completed').all<{ id: string; book_id: string; created_at: string; status: string }>();

      const result: Record<string, any> = {};
      productIds.forEach((id: string) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
      (orders.results || []).forEach(order => {
        if (order.book_id in result) {
          result[order.book_id].hasPurchased = true;
          result[order.book_id].orderDetails.push({ order_id: order.id, purchase_date: order.created_at, status: order.status });
        }
      });

      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json({ error: 'Error checking purchase' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
