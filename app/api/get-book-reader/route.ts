import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const user = await getCurrentUser(req, db, jwtSecret);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Query D1 directly â replaces Supabase .from('orders').select()...
    const order = await db.prepare(
      'SELECT * FROM orders WHERE user_id = ? AND book_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(user.id, bookId, 'completed').first();

    if (!order) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching book reader:', error);
    return NextResponse.json({ error: 'Error fetching book reader' }, { status: 500 });
  }
}
