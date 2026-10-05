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
    if (!payload || payload.purpose !== 'password_reset') {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    // Hash the new password
    const user = await db.prepare('SELECT id, email, full_name, country, updated_at FROM users WHERE id = ?').bind(payload.sub).first<{ id: string; email: string; full_name: string | null; country: string | null; updated_at: string | null }>();
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    // The reset token is invalidated as soon as the password is changed. A
    // token issued before the user's last password update cannot be reused.
    if (user.updated_at) {
      const updatedAtMs = Date.parse(user.updated_at);
      if (Number.isFinite(updatedAtMs) && payload.iat * 1000 <= updatedAtMs) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
      }
    }

    const hashedPassword = await hashPassword(new_password);
    const now = new Date().toISOString();

    // Update the password only if the user record has not changed since the
    // token was issued. This also makes a reset token effectively single-use.
    const updateResult = await db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND (updated_at IS NULL OR updated_at = ?)'
    ).bind(hashedPassword, now, payload.sub, user.updated_at || null).run();
    if (!updateResult.success || (updateResult.meta?.changes ?? 0) !== 1) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    // Create a new session JWT (auto-login after reset)

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
