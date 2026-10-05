import { NextResponse } from 'next/server';
import { verifyPassword, createJwt, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    const user = await db.prepare('SELECT id, email, password_hash, full_name, country, email_confirmed FROM users WHERE email = ?').bind(email.toLowerCase()).first<{
      id: string; email: string; password_hash: string; full_name: string | null; country: string | null; email_confirmed: number;
    }>();

    if (!user) return NextResponse.json({ error: 'There isn\'t a user with that email, dear. To join us, please register or make an account!' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });

    if (!user.email_confirmed) {
      return NextResponse.json({ error: 'Please confirm your email address and try again.', code: 'email_not_confirmed' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    if (user.password_hash === 'RESET_REQUIRED') {
      return NextResponse.json({ error: 'Password reset required', resetRequired: true, email: user.email }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const token = await createJwt({ sub: user.id, email: user.email }, jwtSecret);
    const res = NextResponse.json({ user: { id: user.id, email: user.email, full_name: user.full_name, country: user.country } }, { headers: { 'Cache-Control': 'no-store' } });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}
