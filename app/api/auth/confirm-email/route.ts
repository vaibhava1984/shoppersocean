import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { Resend } from '@/utils/email/resend';
import { COUNTRIES } from '@/utils/countries';
import { addAdminNotification } from '@/utils/adminNotifications';

export const dynamic = 'force-dynamic';

const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
const successHtml = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shoppers Ocean</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:Arial,sans-serif;color:#166534;"><div style="text-align:center;padding:32px;max-width:560px;"><div style="font-size:24px;font-weight:700;">Your e-mail is confirmed. Now you can sign in 😊</div></div></body></html>';
const errorHtml = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shoppers Ocean</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:Arial,sans-serif;color:#334155;"><div style="text-align:center;padding:32px;max-width:560px;"><div style="font-size:20px;font-weight:700;">This confirmation link is invalid or has expired.</div></div></body></html>';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token') || '';
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;
    const resendApiKey = (env as any).RESEND_API_KEY as string | undefined;
    const payload = await verifyJwt(token, jwtSecret);

    if (!payload || payload.purpose !== 'email_confirmation' || typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return new NextResponse(errorHtml, { status: 400, headers });
    }

    // Capture details before the conditional update. Only the request that changes
    // email_confirmed from 0 to 1 is allowed to create the admin notifications.
    const user = await db.prepare(
      'SELECT id, email, full_name, country, gender, city, email_confirmed, created_at FROM users WHERE id = ? AND email = ?'
    ).bind(payload.sub, payload.email.toLowerCase()).first<{
      id: string; email: string; full_name: string | null; country: string | null;
      gender: string | null; city: string | null; email_confirmed: number; created_at: string;
    }>();

    if (!user) return new NextResponse(errorHtml, { status: 400, headers });

    const result = await db.prepare(
      'UPDATE users SET email_confirmed = 1, updated_at = ? WHERE id = ? AND email = ? AND email_confirmed = 0'
    ).bind(new Date().toISOString(), user.id, user.email).run();

    if (result.meta.changes > 0) {
      const name = String(user.full_name || '').trim();
      const countryCode = String(user.country || '').trim().toUpperCase();
      const countryName = COUNTRIES.find(c => c.code === countryCode)?.name || String(user.country || '').trim() || 'Not provided';
      const confirmedAt = new Date().toISOString();

      await addAdminNotification(db, {
        type: 'account_created',
        title: 'New user account confirmed',
        message: (name || user.email) + ' confirmed their Shoppers Ocean account.',
        details: {
          userId: user.id, email: user.email, name, country: countryName,
          gender: user.gender || '', city: user.city || '',
          createdAt: user.created_at, confirmedAt
        }
      });

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const safeName = escapeHtml(name || 'there');
          const { error: adminEmailError } = await resend.emails.send({
            from: 'no-reply@shoppersocean.com',
            to: 'kochimonu@gmail.com',
            subject: 'New user account confirmed | Shoppers Ocean',
            html: '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">' +
              '<p>Dear admin !</p>' +
              '<p style="font-size:16px;"><strong>A new user has confirmed their Shoppers Ocean account on ' + new Date(confirmedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' at ' + new Date(confirmedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST (GMT+5:30)</strong></p>' +
              '<p><strong>Name</strong><br>' + safeName + '</p>' +
              '<p><strong>Email</strong><br>' + escapeHtml(user.email) + '</p>' +
              '<p><strong>Country</strong><br>' + escapeHtml(countryName) + '</p>' +
              '</div>'
          });
          if (adminEmailError) console.error('Error sending confirmed-signup admin email:', adminEmailError);
        } catch (emailError) {
          console.error('Unexpected confirmed-signup admin email error:', emailError);
        }
      } else {
        console.error('RESEND_API_KEY is not configured; confirmed signup admin email was not sent.');
      }
    }

    // A repeated visit to an already-used confirmation link remains successful,
    // but does not create another website notification or send another admin email.
    return new NextResponse(successHtml, { status: 200, headers });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return new NextResponse(errorHtml, { status: 400, headers });
  }
}
