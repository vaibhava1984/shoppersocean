import { Resend } from "@/utils/email/resend";
import { NextResponse } from "next/server";
import { getCurrentUser, clearSession } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import { COUNTRIES } from "@/utils/countries";
import { addAdminNotification } from "@/utils/adminNotifications";

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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to delete your account." },
        { status: 401 }
      );
    }

    const roles = String(user.publicMetadata?.userrole ?? "").split(",").map((role) => role.trim().toUpperCase());
    if (roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Admin accounts cannot be deleted." }, { status: 403 });
    }

    const confirmation = await request.json().catch(() => ({}));
    if (confirmation?.confirm !== true) {
      return NextResponse.json({ error: "Please confirm that you want to delete your account." }, { status: 400 });
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
    const accountName = String(user.firstName ?? "").trim() || email;
    await addAdminNotification(db, {
      type: "account_deleted",
      title: "User account deleted",
      message: accountName + " deleted their account.",
      details: { userId: uid, email, name: accountName, deletedAt: new Date().toISOString() }
    });

    // Remove published author works and their private file records before
    // deleting author rows (books.author_id and private_book_files.book_id are
    // enforced foreign keys in the live database).
    if (await tableExists(db, "private_book_files") && await tableExists(db, "books") && await tableExists(db, "authors")) {
      await db.prepare("DELETE FROM private_book_files WHERE book_id IN (SELECT id FROM books WHERE author_id IN (SELECT id FROM authors WHERE user_id=?))").bind(uid).run();
    }
    if (await tableExists(db, "books") && await tableExists(db, "authors")) {
      await db.prepare("DELETE FROM books WHERE author_id IN (SELECT id FROM authors WHERE user_id=?)").bind(uid).run();
    }

    // This legacy author-interest form is email-linked rather than user_id-linked.
    if (await tableExists(db, "authors_interest_submission")) {
      await db.prepare("DELETE FROM authors_interest_submission WHERE lower(email)=lower(?)").bind(email).run();
    }

    // Discover every account-owned table so subscriptions, payment records,
    // purchases, author submissions, sessions and game quotas are all removed.
    const { results: tableRows = [] } = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all<any>();
    for (const row of tableRows) {
      const table = String(row.name || "");
      if (!/^[A-Za-z0-9_]+$/.test(table) || table === "users" || table === "admin_notifications") continue;
      const { results: columns = [] } = await db.prepare(`PRAGMA table_info("${table}")`).all<any>();
      if (columns.some((column: any) => column.name === "user_id")) {
        await db.prepare(`DELETE FROM "${table}" WHERE user_id=?`).bind(uid).run();
      }
    }

    // auth_sessions references profiles, so profiles is deleted after the
    // user_id-linked auth_sessions rows have been removed.
    if (await tableExists(db, "profiles")) {
      await db.prepare("DELETE FROM profiles WHERE id=?").bind(uid).run();
    }

    // Removing the user row also removes the account from the admin Users list.
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

        const countryValue = String((user.publicMetadata as any)?.country ?? (user.unsafeMetadata as any)?.country ?? "").trim();
        const countryName = COUNTRIES.find(c => c.code === countryValue.toUpperCase())?.name || countryValue || "Not provided";
        const safeCountry = escapeHtml(countryName);
        const { error: adminEmailError } = await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: "kochimonu@gmail.com",
          subject: "User account deleted | Shoppers Ocean",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b;">
              <p>Dear admin !</p>
              <p style="font-size:16px;"><strong>A new user has deleted his/her account on Shopper ocean on ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} at ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST (GMT+5:30)</strong></p>
              <p><strong>Name</strong><br />${safeName}</p>
              <p><strong>Email</strong><br />${escapeHtml(email)}</p>
              <p><strong>Country</strong><br />${safeCountry}</p>
            </div>
          `,
        });
        if (adminEmailError) {
          console.error("Error sending account deletion admin notification:", adminEmailError);
        }

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
