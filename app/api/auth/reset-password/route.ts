import { NextResponse } from 'next/server';
import { hashPassword, createJwt, setSessionCookie, verifyJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 * Body: { token, new_password }
 *
 * Step 1: User requests reset â /api/auth/request-reset sends them an email with a link
 * Step 2: User clicks link â arrives at /reset-password?token=XXX
 * Step 3: This endpoint verifies the token and sets the new password
 */
export async function POST(req: Request) {
  try {
    const { token, new_password } = await req.json();

    if (!token || !new_password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;

    // Verify the reset token (it's a JWT with sub = user id, exp = 1 hour)
    const payload = await verifyJwt(token, jwtSecret);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(new_password);
    const now = new Date().toISOString();

    // Update the user's password
    await db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(hashedPassword, now, payload.sub).run();

    // Create a new session JWT (auto-login after reset)
    const user = await db.prepare('SELECT id, email, full_name, country FROM users WHERE id = ?').bind(payload.sub).first<{ id: string; email: string; full_name: string | null; country: string | null }>();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessionToken = await createJwt({ sub: user.id, email: user.email }, jwtSecret);
    const res = NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
    setSessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
