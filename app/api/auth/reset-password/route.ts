import { NextResponse } from 'next/server';
import { hashPassword, createJwt, setSessionCookie, verifyJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, new_password } = await req.json();

    if (typeof token !== 'string' || typeof new_password !== 'string' || !token || !new_password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database | undefined;
    const jwtSecret = (env as any).JWT_SECRET as string | undefined;

    if (!db || !jwtSecret) {
      return NextResponse.json({ error: 'Password reset service is unavailable' }, { status: 503 });
    }

    const payload = await verifyJwt(token, jwtSecret);
    if (!payload || payload.purpose !== 'password_reset' || !Number.isFinite(payload.iat) || payload.iat <= 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    const user = await db.prepare(
      'SELECT id, email, full_name, country, updated_at FROM users WHERE id = ? LIMIT 1'
    ).bind(payload.sub).first<{
      id: string;
      email: string;
      full_name: string | null;
      country: string | null;
      updated_at: string | null;
    }>();

    if (!user || user.email.toLowerCase() !== payload.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    if (user.updated_at) {
      const updatedAtMs = Date.parse(user.updated_at);
      if (Number.isFinite(updatedAtMs) && payload.iat * 1000 <= updatedAtMs) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
      }
    }

    const hashedPassword = await hashPassword(new_password);
    const now = new Date().toISOString();

    const updateResult = await db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND (updated_at IS NULL OR updated_at = ?)'
    ).bind(hashedPassword, now, user.id, user.updated_at || null).run();

    if (!updateResult.success || (updateResult.meta?.changes ?? 0) !== 1) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 });
    }

    const sessionToken = await createJwt({ sub: user.id, email: user.email }, jwtSecret);
    const res = NextResponse.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, country: user.country }
    }, { headers: { 'Cache-Control': 'no-store' } });
    setSessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
