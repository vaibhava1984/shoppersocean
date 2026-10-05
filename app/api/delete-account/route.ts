import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getCurrentUser, clearSession } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function tableHasUserId(db: any, table: string) {
  const row = await db
    .prepare("SELECT 1 FROM pragma_table_info(?) WHERE name='user_id' LIMIT 1")
    .bind(table)
    .first<any>();
  return Boolean(row);
}

async function tableExists(db: any, table: string) {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1")
    .bind(table)
    .first<any>();
  return Boolean(row);
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to delete your account." },
        { status: 401 }
      );
    }

    const email = user.emailAddresses?.[0]?.emailAddress?.trim();
    if (!email) {
      return NextResponse.json(
        { error: "Your account does not have an email address." },
        { status: 400 }
      );
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json(
        { error: "Cloudflare database is unavailable" },
        { status: 503 }
      );
    }

    const uid = user.id;

    // Delete dependent records first. This order matters because the live D1
    // schema has foreign keys from auth_sessions -> profiles and from
    // sessions/password_reset_tokens -> users.
    const dependentTables = [
      "payments",
      "orders",
      "testimonials",
      "user_book_reviews",
      "user_roles",
      "authors",
      "auth_sessions",
      "sessions",
      "password_reset_tokens",
      "authors_interest_submission",
    ];

    for (const table of dependentTables) {
      if (await tableExists(db, table) && await tableHasUserId(db, table)) {
        await db.prepare(`DELETE FROM "${table}" WHERE user_id=?`).bind(uid).run();
      }
    }

    // profiles is a separate legacy account-data table and auth_sessions
    // references it, so it is removed only after auth_sessions above.
    if (await tableExists(db, "profiles")) {
      await db.prepare("DELETE FROM profiles WHERE id=?").bind(uid).run();
    }

    // The current authentication identity is stored in users.
    await db.prepare("DELETE FROM users WHERE id=?").bind(uid).run();

    // The account is deleted independently of email delivery.
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error(
          "RESEND_API_KEY is not configured; account was deleted without confirmation email."
        );
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

        if (emailError) {
          console.error("Error sending account deletion email:", emailError);
        } else {
          emailSent = true;
        }
      }
    } catch (emailError) {
      console.error("Unexpected account deletion email error:", emailError);
    }

    await clearSession();
    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error("Unexpected account deletion error:", error);
    return NextResponse.json(
      { error: "Unable to delete your account. Please try again." },
      { status: 500 }
    );
  }
}
