import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCurrentUser } from '@/utils/auth/session';
import { getD1 } from '@/utils/cloudflare/d1';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function deleteIfPresent(db: any, sql: string, userId: string) {
  try { await db.prepare(sql).bind(userId).run(); } catch {}
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'You must be signed in to delete your account.' }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: 'Cloudflare database is unavailable.' }, { status: 503 });

    const userId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'Your account does not have an email address.' }, { status: 400 });

    const orders = await db.prepare('SELECT id FROM orders WHERE user_id=?').bind(userId).all<{ id: string }>();
    for (const order of orders.results ?? []) {
      await db.prepare('DELETE FROM payments WHERE order_id=?').bind(order.id).run().catch(() => {});
    }

    await deleteIfPresent(db, 'DELETE FROM book_reviews WHERE user_id=?', userId);
    await deleteIfPresent(db, 'DELETE FROM testimonials WHERE user_id=?', userId);
    await deleteIfPresent(db, 'DELETE FROM authors_interest_submission WHERE user_id=?', userId);
    await deleteIfPresent(db, 'DELETE FROM authors WHERE user_id=?', userId);
    await deleteIfPresent(db, 'DELETE FROM orders WHERE user_id=?', userId);

    await db.prepare('DELETE FROM users WHERE id=?').bind(userId).run();

    let emailSent = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const safeName = escapeHtml(String(user.firstName || 'there').trim() || 'there');
        const { error } = await resend.emails.send({
          from: 'no-reply@shoppersocean.com',
          to: email,
          subject: 'Your Shoppers Ocean account has been deleted',
          html: '<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b">' +
            '<p>Dear ' + safeName + ',</p>' +
            '<p>Your Shoppers Ocean account has been deleted successfully.</p>' +
            '<p>Regards,<br/>Shoppers Ocean</p></div>',
        });
        emailSent = !error;
      } catch (error) {
        console.error('Account deletion email error:', error);
      }
    }

    const response = NextResponse.json({ success: true, emailSent });
    response.headers.append('Set-Cookie', 'so_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500 });
  }
}
