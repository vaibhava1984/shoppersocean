import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { hashPassword, createJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
  try {
    const { email, password, full_name, country } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;
    const resendApiKey = (env as any).RESEND_API_KEY as string | undefined;
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    const now = new Date().toISOString();

    await db.prepare('INSERT INTO users (id, email, password_hash, full_name, country, email_confirmed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
      .bind(userId, normalizedEmail, hashedPassword, full_name || null, country || null, now, now).run();

    let emailSent = false;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const safeName = escapeHtml(String(full_name || '').trim() || 'there');
        const confirmationToken = await createJwt({ sub: userId, email: normalizedEmail, purpose: 'email_confirmation' }, jwtSecret, 24 * 3600);
        const confirmationUrl = 'https://www.shoppersocean.com/api/auth/confirm-email?token=' + encodeURIComponent(confirmationToken);
        const { error: emailError } = await resend.emails.send({
          from: 'no-reply@shoppersocean.com',
          to: normalizedEmail,
          subject: 'Welcome to Shoppers Ocean',
          html: '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">' +
            '<p>Hi ' + safeName + ' 😊😊😊</p>' +
            '<p>Your account on 𝙎𝙝𝙤𝙥𝙥𝙚𝙧𝙨 𝙊𝙘𝙚𝙖𝙣 has been created successfully!! 🤗🤗🤗</p>' +
            '<p>We cordially welcome you to our family, where reading, writing, and shopping are really fun!!</p>' +
            '<p>Wishing to have a long-lasting journey with you</p>' +
            '<p>Please confirm your account by clicking the button below.</p>' +
            '<p style="text-align:center;margin:28px 0;"><a href="' + confirmationUrl + '" role="button" style="background:#16a34a;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:700;font-family:Arial,sans-serif;">Confirm your email</a></p>' +
            '<p>Regards,</p><p>𝙎𝙝𝙤𝙥𝙥𝙚𝙧𝙨 𝙊𝙘𝙚𝙖𝙣</p></div>'
        });
        if (emailError) console.error('Error sending signup welcome email:', emailError);
        else emailSent = true;

        const safeCountry = escapeHtml(String(country || '').trim() || 'Not provided');
        const { error: adminEmailError } = await resend.emails.send({
          from: 'no-reply@shoppersocean.com',
          to: 'kochimonu@gmail.com',
          subject: 'New user account created | Shoppers Ocean',
          html: '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">' +
            '<p>Dear admin !</p>' +
            '<p>A new user has created an account on Shopper ocean on ' + new Date(now).toLocaleDateString('en-IN') + ' at ' + new Date(now).toLocaleTimeString('en-IN') + '</p>' +
            '<p><strong>Name</strong><br>' + safeName + '</p>' +
            '<p><strong>Email</strong><br>' + escapeHtml(normalizedEmail) + '</p>' +
            '<p><strong>Country</strong><br>' + safeCountry + '</p>' +
            '</div>'
        });
        if (adminEmailError) console.error('Error sending signup admin notification:', adminEmailError);
      } catch (emailError) { console.error('Unexpected signup email error:', emailError); }
    } else console.error('RESEND_API_KEY is not configured; account was created without welcome email.');

    const user = { id: userId, email: normalizedEmail, full_name: full_name || null, country: country || null };
    return NextResponse.json({ user, emailSent, emailConfirmed: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
