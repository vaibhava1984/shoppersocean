import { NextResponse } from 'next/server';
import { createJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/request-reset
 * Body: { email }
 *
 * Generates a password reset JWT (valid for 1 hour) and sends it via email
 * using the existing Resend API key binding.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;
    const resendApiKey = (env as any).RESEND_API_KEY as string;

    // Find user
    const user = await db.prepare('SELECT id, email, full_name FROM users WHERE email = ?').bind(email.toLowerCase()).first<{ id: string; email: string; full_name: string | null }>();

    // Always return success (don't reveal whether email exists)
    if (!user) {
      return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Create a reset token (valid for 1 hour)
    const resetToken = await createJwt({ sub: user.id, email: user.email, purpose: 'password_reset' }, jwtSecret, 3600);

    // Always send users to the real public site, not a preview/worker hostname.
    // This prevents reset links from becoming invalid when the request is handled
    // through a Cloudflare/preview hostname.
    const resetUrl = `https://www.shoppersocean.com/reset-password?token=${resetToken}`;

    // Send email via Resend
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Shoppers Ocean <noreply@shoppersocean.com>',
          to: [user.email],
          subject: 'Password Reset - Shoppers Ocean',
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Password Reset</h2>
              <p>Hello ${user.full_name || 'there'},</p>
              <p>You requested a password reset for your Shoppers Ocean account.</p>
              <p>Click the button below to set a new password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; display: inline-block;">Reset Password</a>
              </p>
              <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              <p style="color: #666; font-size: 14px;">Or copy this link: ${resetUrl}</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const resendError = await emailResponse.text();
        console.error('Failed to send reset email:', resendError);
        return NextResponse.json(
          { error: 'Failed to send reset email' },
          { status: 502, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}
