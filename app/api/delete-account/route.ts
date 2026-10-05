import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getCurrentUser, clearSession } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function tableExists(db: any, table: string) {
  const row = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").bind(table).first<any>();
  return Boolean(row);
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be signed in to delete your account." }, { status: 401 });

    const email = user.emailAddresses?.[0]?.emailAddress?.trim();
    if (!email) return NextResponse.json({ error: "Your account does not have an email address." }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const uid = user.id;

    if (await tableExists(db, "orders")) {
      const orders = await db.prepare("SELECT id FROM orders WHERE user_id=?").bind(uid).all<any>();
      if (await tableExists(db, "payments")) {
        for (const order of orders.results ?? []) {
          if (order?.id) await db.prepare("DELETE FROM payments WHERE order_id=?").bind(order.id).run();
        }
      }
      await db.prepare("DELETE FROM orders WHERE user_id=?").bind(uid).run();
    }

    for (const table of ["testimonials", "authors_interest_submission", "auth_sessions", "password_reset_tokens"]) {
      if (await tableExists(db, table)) {
        await db.prepare(`DELETE FROM ${table} WHERE user_id=?`).bind(uid).run();
      }
    }

    if (await tableExists(db, "authors")) {
      await db.prepare("DELETE FROM authors WHERE user_id=?").bind(uid).run();
    }

    // D1 authentication uses users. The old profiles deletion was a legacy path.
    await db.prepare("DELETE FROM users WHERE id=?").bind(uid).run();

    // Deletion is independent of email delivery.
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("RESEND_API_KEY is not configured; account was deleted without confirmation email.");
      } else {
        const resend = new Resend(resendApiKey);
        const name = String(user.firstName ?? "").trim() || "there";
        const safeName = escapeHtml(name);
        const { error: emailError } = await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: email,
          subject: "Your Shoppers Ocean account has been deleted",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b;">
              <p>Dear ${safeName},</p>
              <p>Sorry to see you go ! ☹️☹️</p>
              <p>Your account has been deleted successfully !</p>
              <p>Regards,<br />Shoppers Ocean</p>
            </div>
          `,
        });
        if (emailError) console.error("Error sending account deletion email:", emailError);
        else emailSent = true;
      }
    } catch (emailError) {
      console.error("Unexpected account deletion email error:", emailError);
    }

    await clearSession();
    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error("Unexpected account deletion error:", error);
    return NextResponse.json({ error: "Unable to delete your account. Please try again." }, { status: 500 });
  }
}
