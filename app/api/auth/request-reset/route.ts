import { NextResponse } from 'next/server';
import { createJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database | undefined;
    const jwtSecret = (env as any).JWT_SECRET as string | undefined;
    const resendApiKey = (env as any).RESEND_API_KEY as string | undefined;

    if (!db || !jwtSecret || !resendApiKey) {
      console.error('Password reset service is not fully configured');
      return NextResponse.json({ error: 'Password reset service is unavailable' }, { status: 503 });
    }

    const user = await db.prepare(
      'SELECT id, email, full_name FROM users WHERE email = ? LIMIT 1'
    ).bind(email).first<{ id: string; email: string; full_name: string | null }>();

    if (!user) {
      return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const resetToken = await createJwt(
      { sub: user.id, email: user.email, purpose: 'password_reset' },
      jwtSecret,
      3600
    );

    const resetUrl = 'https://www.shoppersocean.com/reset-password?token=' + encodeURIComponent(resetToken);
    const safeName = String(user.full_name || 'there')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + resendApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Shoppers Ocean <noreply@shoppersocean.com>',
        to: [user.email],
        subject: 'Password Reset - Shoppers Ocean',
        html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;">' +
          '<h2 style="color:#2563eb;">Password Reset</h2>' +
          '<p>Hello ' + safeName + ',</p>' +
          '<p>You requested a password reset for your Shoppers Ocean account.</p>' +
          '<p>Click the button below to set a new password:</p>' +
          '<p style="text-align:center;margin:30px 0;"><a href="' + resetUrl +
          '" style="background:#2563eb;color:white;padding:12px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>' +
          '<p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn’t request this, you can safely ignore this email.</p>' +
          '</div>',
      }),
    });

    if (!emailResponse.ok) {
      const resendError = await emailResponse.text();
      console.error('Failed to send reset email:', resendError);
      return NextResponse.json({ error: 'Failed to send reset email' }, {
        status: 502, headers: { 'Cache-Control': 'no-store' }
      });
    }

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
