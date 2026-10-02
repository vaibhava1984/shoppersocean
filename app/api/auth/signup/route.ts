import { NextResponse } from 'next/server';
import { hashPassword, createJwt, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password, full_name, country } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Access D1 binding via getCloudflareContext (OpenNext adapter)
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    // Check if user already exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create user
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString();

    await db.prepare(
      'INSERT INTO users (id, email, password_hash, full_name, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(userId, email.toLowerCase(), hashedPassword, full_name || null, country || null, now, now).run();

    // Create session JWT
    const token = await createJwt({ sub: userId, email: email.toLowerCase() }, jwtSecret);

    const user = { id: userId, email: email.toLowerCase(), full_name: full_name || null, country: country || null };
    const res = NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
