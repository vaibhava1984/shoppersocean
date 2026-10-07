import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createJwt, verifyJwt } from "@/lib/auth";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { COUNTRIES } from "@/utils/countries";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ADMIN_EMAIL = "kochimonu@gmail.com";
const BASE_URL = "https://www.shoppersocean.com";

function escapeHtml(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS author_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    paypal_id TEXT,
    upi_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_author_applications_status_created ON author_applications(status, created_at)").run();
  for (const statement of [
    "ALTER TABLE author_applications ADD COLUMN approved_at TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_deadline TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_order_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_currency TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_amount REAL"
  ]) {
    try { await db.prepare(statement).run(); } catch {}
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in to register as an author." }, { status: 401 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const city = String(body.city ?? "").trim();
    const age = Number(body.age);
    const gender = String(body.gender ?? "").trim();
    const paypalId = String(body.paypalId ?? "").trim();

    const country = COUNTRIES.find((c) => c.code === String(identity.profile.country ?? "").toUpperCase())?.name
      || String(identity.profile.country ?? "").trim();

    if (!title || !fullName || !city || !country || !gender || !Number.isInteger(age) || age < 1 || age > 120) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (country !== "India" && !paypalId) {
      return NextResponse.json({ error: "Please provide your PayPal ID." }, { status: 400 });
    }

    await ensureTable(db);

    const existingAuthor = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(identity.profile.id).first();
    if (existingAuthor) {
      return NextResponse.json({ error: "You are already a registered Shoppers Ocean author." }, { status: 409 });
    }

    const pending = await db.prepare("SELECT id FROM author_applications WHERE user_id=? AND status='pending' LIMIT 1").bind(identity.profile.id).first();
    if (pending) {
      return NextResponse.json({ error: "Your author application is already under review." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO author_applications
      (id,user_id,title,full_name,email,city,country,age,gender,paypal_id,upi_number,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(
        id,
        identity.profile.id,
        title,
        fullName,
        identity.profile.email,
        city,
        country,
        age,
        gender,
        country === "India" ? null : paypalId,
        null,
        "pending",
        now
      )
      .run();

    const { env } = await getCloudflareContext();
    const jwtSecret = String(env.JWT_SECRET || "");
    const resendApiKey = String(env.RESEND_API_KEY || "");
    if (!jwtSecret || !resendApiKey) {
      return NextResponse.json({ error: "Application saved, but the approval email service is not configured." }, { status: 503 });
    }

    const approveToken = await createJwt(
      { sub: id, email: identity.profile.email, purpose: "author_application_approve" },
      jwtSecret,
      24 * 3600
    );
    const rejectToken = await createJwt(
      { sub: id, email: identity.profile.email, purpose: "author_application_reject" },
      jwtSecret,
      24 * 3600
    );

    const approveUrl = BASE_URL + "/api/author-application?token=" + encodeURIComponent(approveToken);
    const rejectUrl = BASE_URL + "/api/author-application?token=" + encodeURIComponent(rejectToken);

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: "no-reply@shoppersocean.com",
      to: ADMIN_EMAIL,
      subject: "New Author Registration Application | Shoppers Ocean",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
        <h2>New Author Registration Application</h2>
        <p><strong>Title:</strong> ${escapeHtml(title)}</p>
        <p><strong>Full name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>E-mail ID:</strong> ${escapeHtml(identity.profile.email)}</p>
        <p><strong>City:</strong> ${escapeHtml(city)}</p>
        <p><strong>Country:</strong> ${escapeHtml(country)}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Gender:</strong> ${escapeHtml(gender)}</p>
        <p><strong>PayPal ID:</strong> ${escapeHtml(paypalId || "Not applicable")}</p>
        <div style="margin:30px 0;text-align:center;">
          <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 25px;border-radius:6px;text-decoration:none;font-weight:700;margin-right:12px;">Approve</a>
          <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:13px 25px;border-radius:6px;text-decoration:none;font-weight:700;">Reject</a>
        </div>
      </div>`,
    });

    if (error) {
      console.error("Author application email error:", error);
      return NextResponse.json({ error: "Application saved, but the notification email could not be sent." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Author application error:", error);
    return NextResponse.json({ error: "Unable to submit author application." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";

  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;
    const jwtSecret = String(env.JWT_SECRET || "");
    const resendApiKey = String(env.RESEND_API_KEY || "");
    const payload = await verifyJwt(token, jwtSecret);

    if (!payload || !payload.purpose || !["author_application_approve", "author_application_reject"].includes(payload.purpose)) {
      return new Response("This approval link is invalid or has expired.", { status: 400 });
    }
    if (!db) return new Response("Cloudflare database unavailable.", { status: 503 });
    if (!resendApiKey) return new Response("Email service is not configured.", { status: 503 });

    await ensureTable(db);

    const application = await db.prepare("SELECT * FROM author_applications WHERE id=? LIMIT 1").bind(payload.sub).first<any>();
    if (!application) return new Response("Application not found.", { status: 404 });
    if (application.status !== "pending") return new Response("This application has already been reviewed.", { status: 409 });

    const now = new Date().toISOString();
    const resend = new Resend(resendApiKey);

    if (payload.purpose === "author_application_reject") {
      await db.prepare("UPDATE author_applications SET status='rejected',reviewed_at=? WHERE id=? AND status='pending'")
        .bind(now, application.id).run();

      await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: application.email,
        subject: "Shoppers Ocean Author Application",
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
          <p>Dear ${escapeHtml(application.full_name)},</p>
          <p>I am sorry. Unfortunately your application to register yourself as an author with Shoppers Ocean hasn't been approved. However you can continue with us being our esteemed user. Let's continue this journey of entertainment together.</p>
          <p>Regards,<br/>Shoppers Ocean</p>
        </div>`,
      });

      return new Response("<h2>Application rejected</h2><p>The applicant has been notified.</p>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const existingAuthor = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1")
      .bind(application.user_id).first();

    if (!existingAuthor) {
      await db.prepare("INSERT INTO authors(id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), application.full_name, "-", application.user_id, 0, now, now).run();
    }

    await db.prepare("UPDATE author_applications SET status='approved',reviewed_at=? WHERE id=? AND status='pending'")
      .bind(now, application.id).run();

    await resend.emails.send({
      from: "no-reply@shoppersocean.com",
      to: application.email,
      subject: "Shoppers Ocean Author Application Approved",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
        <p>Dear ${escapeHtml(application.full_name)},</p>
        <p>Congratulations 🎉</p>
        <p>Your application to register yourself as an author at Shoppers ocean has been approved. Looking forward to having a long lasting journey together.</p>
        <p>Regards,<br/>Shoppers Ocean</p>
      </div>`,
    });

    return new Response("<h2>Application approved</h2><p>The applicant has been notified and has been added to the Authors list.</p>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Author application review error:", error);
    return new Response("Unable to process this application.", { status: 500 });
  }
}    const now = new Date().toISOString();

    if (payload.purpose === "author_application_reject") {
      await db.prepare("UPDATE author_applications SET status='rejected',reviewed_at=? WHERE id=? AND status='pending'")
        .bind(now, application.id).run();

      await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: application.email,
        subject: "Shoppers Ocean Author Application",
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
          <p>Dear ${escapeHtml(application.full_name)},</p>
          <p>I am sorry. Unfortunately your application to register yourself as an author with Shoppers Ocean hasn't been approved. However, you can continue with us as our esteemed user. Let's continue this journey of entertainment together.</p>
          <p>Regards,<br/>Shoppers Ocean</p>
        </div>`,
      });

      return new Response("<h2>Application rejected</h2><p>The applicant has been notified.</p>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const paymentDeadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    await db.prepare("UPDATE author_applications SET status='approved_payment_pending',reviewed_at=?,approved_at=?,payment_deadline=? WHERE id=? AND status='pending'")
      .bind(now, now, paymentDeadline, application.id).run();

    await resend.emails.send({
      from: "no-reply@shoppersocean.com",
      to: application.email,
      subject: "Shoppers Ocean Author Application Approved",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
        <p>Dear ${escapeHtml(application.full_name)},</p>
        <p>Congratulations 🎉</p>
        <p>Your application to register yourself as an author at Shoppers ocean has been approved. Please login and continue your registration process within 24 hours. Looking forward to having a long lasting journey together.</p>
        <p>Regards,<br/>Shoppers Ocean</p>
      </div>`,
    });

    return new Response("<h2>Application approved</h2><p>The applicant has been notified and may now log in to complete the registration payment within 24 hours.</p>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });  } catch (error) {
    console.error("Author application error:", error);
    return NextResponse.json({ error: "Unable to submit author application." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";

  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;
    const jwtSecret = String(env.JWT_SECRET || "");
    const resendApiKey = String(env.RESEND_API_KEY || "");
    const payload = await verifyJwt(token, jwtSecret);

    if (!payload || !payload.purpose || !["author_application_approve", "author_application_reject"].includes(payload.purpose)) {
      return new Response("This approval link is invalid or has expired.", { status: 400 });
    }
    if (!db) return new Response("Cloudflare database unavailable.", { status: 503 });
    if (!resendApiKey) return new Response("Email service is not configured.", { status: 503 });

    await ensureTable(db);

    const application = await db.prepare("SELECT * FROM author_applications WHERE id=? LIMIT 1").bind(payload.sub).first<any>();
    if (!application) return new Response("Application not found.", { status: 404 });
    if (application.status !== "pending") return new Response("This application has already been reviewed.", { status: 409 });

    const now = new Date().toISOString();
    const resend = new Resend(resendApiKey);

    if (payload.purpose === "author_application_reject") {
      await db.prepare("UPDATE author_applications SET status='rejected',reviewed_at=? WHERE id=? AND status='pending'")
        .bind(now, application.id).run();

      await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: application.email,
        subject: "Shoppers Ocean Author Application",
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
          <p>Dear ${escapeHtml(application.full_name)},</p>
          <p>I am sorry. Unfortunately your application to register yourself as an author with Shoppers Ocean hasn't been approved. However you can continue with us being our esteemed user. Let's continue this journey of entertainment together.</p>
          <p>Regards,<br/>Shoppers Ocean</p>
        </div>`,
      });

      return new Response("<h2>Application rejected</h2><p>The applicant has been notified.</p>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const existingAuthor = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1")
      .bind(application.user_id).first();

    if (!existingAuthor) {
      await db.prepare("INSERT INTO authors(id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), application.full_name, "-", application.user_id, 0, now, now).run();
    }

    await db.prepare("UPDATE author_applications SET status='approved',reviewed_at=? WHERE id=? AND status='pending'")
      .bind(now, application.id).run();

    await resend.emails.send({
      from: "no-reply@shoppersocean.com",
      to: application.email,
      subject: "Shoppers Ocean Author Application Approved",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;">
        <p>Dear ${escapeHtml(application.full_name)},</p>
        <p>Congratulations 🎉</p>
        <p>Your application to register yourself as an author at Shoppers ocean has been approved. Looking forward to having a long lasting journey together.</p>
        <p>Regards,<br/>Shoppers Ocean</p>
      </div>`,
    });

    return new Response("<h2>Application approved</h2><p>The applicant has been notified and has been added to the Authors list.</p>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Author application review error:", error);
    return new Response("Unable to process this application.", { status: 500 });
  }
}
