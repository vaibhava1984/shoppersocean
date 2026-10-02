import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    const user = await getCurrentUser(req, db, jwtSecret);

    if (!user) {
      return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
