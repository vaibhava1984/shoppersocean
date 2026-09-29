import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSessionUser } from '@/utils/auth/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    const body = await req.json();
    const { productId, productIds } = body;
    const ids = productId ? [String(productId)] : Array.isArray(productIds) ? productIds.map(String) : [];
    if (!ids.length) return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400 });
    const { env } = await getCloudflareContext({ async: true });
    const placeholders = ids.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `SELECT id, book_id, created_at, status FROM orders WHERE user_id = ? AND book_id IN (${placeholders}) AND status = 'completed' ORDER BY created_at DESC`
    ).bind(user.id, ...ids).all<{ id: string; book_id: string; created_at: string; status: string }>();
    if (productId) return NextResponse.json({ hasPurchased: rows.results.length > 0, orderDetails: rows.results.map(o => ({ order_id: o.id, purchase_date: o.created_at, status: o.status })) }, { headers: { 'Cache-Control': 'no-store' } });
    const result: Record<string, { hasPurchased: boolean; orderDetails: any[] }> = {};
    ids.forEach(id => { result[id] = { hasPurchased: false, orderDetails: [] }; });
    rows.results.forEach(o => { if (result[o.book_id]) { result[o.book_id].hasPurchased = true; result[o.book_id].orderDetails.push({ order_id: o.id, purchase_date: o.created_at, status: o.status }); } });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json({ error: 'Error checking purchase' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}