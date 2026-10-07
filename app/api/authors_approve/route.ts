import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { Resend } from "resend";

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS author_applications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, full_name TEXT NOT NULL,
    email TEXT NOT NULL, city TEXT NOT NULL, country TEXT NOT NULL, age INTEGER NOT NULL,
    gender TEXT NOT NULL, paypal_id TEXT, upi_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, reviewed_at TEXT, approved_at TEXT, payment_deadline TEXT, payment_order_id TEXT, payment_id TEXT, payment_currency TEXT, payment_amount REAL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_author_applications_status_created ON author_applications(status, created_at)").run();
  for (const statement of [
    "ALTER TABLE author_applications ADD COLUMN approved_at TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_deadline TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_order_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_currency TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_amount REAL"
  ]) { try { await db.prepare(statement).run(); } catch {} }
}

function escapeHtml(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function sendApprovalEmail(env: any, application: any) {
  const resend = new Resend(String(env.RESEND_API_KEY || ""));
  return resend.emails.send({
    from: "no-reply@shoppersocean.com",
    to: application.email,
    subject: "Shoppers Ocean Author Application Approved",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${escapeHtml(application.full_name)},</p><p>Congratulations 🎉</p><p>Your application to register yourself as an author at Shoppers ocean has been approved. Please login and continue your registration process within 24 hours. Looking forward to having a long lasting journey together.</p><p>Regards,<br/>Shoppers Ocean</p></div>`,
  });
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });
    await ensureTable(db);
    const { results = [] } = await db.prepare("SELECT * FROM author_applications ORDER BY created_at DESC").all<any>();
    return NextResponse.json({ authors: results }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });
    await ensureTable(db);

    const { application_id } = await request.json();
    if (!application_id) return NextResponse.json({ error: "Application ID is required" }, { status: 400 });

    const application = await db.prepare("SELECT * FROM author_applications WHERE id=? LIMIT 1").bind(application_id).first<any>();
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (application.status !== "pending") return NextResponse.json({ error: "Application has already been reviewed" }, { status: 409 });

    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    const now = new Date().toISOString();
    const paymentDeadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    await db.prepare("UPDATE author_applications SET status='approved_payment_pending',reviewed_at=?,approved_at=?,payment_deadline=? WHERE id=? AND status='pending'")
      .bind(now, now, paymentDeadline, application.id).run();

    const { error } = await sendApprovalEmail(env, application);
    if (error) console.error("Manual author approval email error:", error);

    return NextResponse.json({ message: "Application approved. Payment is now required within 24 hours." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
