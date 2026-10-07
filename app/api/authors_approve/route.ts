import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { Resend } from "resend";

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS author_applications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, full_name TEXT NOT NULL,
    email TEXT NOT NULL, city TEXT NOT NULL, country TEXT NOT NULL, age INTEGER NOT NULL,
    gender TEXT NOT NULL, paypal_id TEXT, upi_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, reviewed_at TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_author_applications_status_created ON author_applications(status, created_at)").run();
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
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${escapeHtml(application.full_name)},</p><p>Congratulations 🎉</p><p>Your application to register yourself as an author at Shoppers ocean has been approved. Looking forward to having a long lasting journey together.</p><p>Regards,<br/>Shoppers Ocean</p></div>`,
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
    const existingAuthor = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(application.user_id).first();

    if (!existingAuthor) {
      await db.prepare("INSERT INTO authors(id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), application.full_name, "-", application.user_id, 0, now, now).run();
    }

    await db.prepare("UPDATE author_applications SET status='approved',reviewed_at=? WHERE id=? AND status='pending'")
      .bind(now, application.id).run();

    const { error } = await sendApprovalEmail(env, application);
    if (error) console.error("Manual author approval email error:", error);

    return NextResponse.json({ message: "Author approved successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
