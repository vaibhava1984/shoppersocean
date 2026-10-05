import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' };
const successHtml = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shoppers Ocean</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:Arial,sans-serif;color:#166534;"><div style="text-align:center;padding:32px;max-width:560px;"><div style="font-size:24px;font-weight:700;">Your e-mail is confirmed. Now you can sign in 😊</div></div></body></html>';
const errorHtml = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shoppers Ocean</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;font-family:Arial,sans-serif;color:#334155;"><div style="text-align:center;padding:32px;max-width:560px;"><div style="font-size:20px;font-weight:700;">This confirmation link is invalid or has expired.</div></div></body></html>';

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token') || '';
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database;
    const jwtSecret = (env as any).JWT_SECRET as string;
    const payload = await verifyJwt(token, jwtSecret);

    if (!payload || payload.purpose !== 'email_confirmation') return new NextResponse(errorHtml, { status: 400, headers });

    const result = await db.prepare('UPDATE users SET email_confirmed = 1, updated_at = ? WHERE id = ? AND email = ? AND email_confirmed = 0')
      .bind(new Date().toISOString(), payload.sub, payload.email.toLowerCase()).run();

    if (!result.meta.changes) {
      const user = await db.prepare('SELECT email_confirmed FROM users WHERE id = ? AND email = ?')
        .bind(payload.sub, payload.email.toLowerCase()).first<{ email_confirmed: number }>();
      if (!user || !user.email_confirmed) return new NextResponse(errorHtml, { status: 400, headers });
    }

    return new NextResponse(successHtml, { status: 200, headers });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return new NextResponse(errorHtml, { status: 400, headers });
  }
}
