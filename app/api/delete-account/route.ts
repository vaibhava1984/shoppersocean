import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getCurrentUser, clearSession } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be signed in to delete your account." }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const uid = String(user.id);
    const orders = await db.prepare("SELECT id FROM orders WHERE user_id=?").bind(uid).all<any>();
    for (const row of orders.results) await db.prepare("DELETE FROM payments WHERE order_id=?").bind(row.id).run();
    await db.prepare("DELETE FROM testimonials WHERE user_id=?").bind(uid).run();
    await db.prepare("DELETE FROM authors_interest_submission WHERE user_id=?").bind(uid).run();
    await db.prepare("DELETE FROM authors WHERE user_id=?").bind(uid).run();
    await db.prepare("DELETE FROM orders WHERE user_id=?").bind(uid).run();
    await db.prepare("DELETE FROM auth_sessions WHERE user_id=?").bind(uid).run();
    await db.prepare("DELETE FROM profiles WHERE id=?").bind(uid).run();
    await clearSession();
    let emailSent = false;
    const email = String(user.email || "");
    const key = process.env.RESEND_API_KEY;
    if (key && email) {
      try {
        const resend = new Resend(key);
        const { error } = await resend.emails.send({ from: "no-reply@shoppersocean.com", to: email, subject: "Your Shoppers Ocean account has been deleted", html: "<p>Your Shoppers Ocean account has been deleted successfully.</p><p>Regards,<br/>Shoppers Ocean</p>" });
        emailSent = !error;
      } catch (error) { console.error(error); }
    }
    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete your account. Please try again." }, { status: 500 });
  }
}