import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });
    const { author_id } = await request.json();
    const id = String(author_id ?? "").trim();
    if (!id) return NextResponse.json({ error: "Author ID is required" }, { status: 400 });

    const author = await db.prepare(
      "SELECT a.id,a.name,a.user_id,u.email,u.role FROM authors a LEFT JOIN users u ON u.id=a.user_id WHERE a.id=? AND COALESCE(a.is_deleted,0)=0 LIMIT 1"
    ).bind(id).first<any>();
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
    if (String(author.role || "").toLowerCase() === "admin") {
      return NextResponse.json({ error: "The admin account cannot be deleted from Authors." }, { status: 403 });
    }

    const now = new Date().toISOString();
    await db.prepare("UPDATE books SET is_deleted=1 WHERE author_id=? AND COALESCE(is_deleted,0)=0").bind(id).run();
    await db.prepare("UPDATE authors SET is_deleted=1,updated_at=? WHERE id=? AND COALESCE(is_deleted,0)=0").bind(now,id).run();

    let emailSent = false;
    try {
      const { env } = await getCloudflareContext();
      const resendKey = String(env.RESEND_API_KEY || "");
      if (resendKey && author.email) {
        const resend = new Resend(resendKey);
        const { error } = await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: String(author.email),
          subject: "Shoppers Ocean Author Association Terminated",
          html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${escapeHtml(String(author.name || "Author"))},</p><p>Your association with Shoppers Ocean as an author has been terminated.</p><p>Regards,<br/>Shoppers Ocean</p></div>`,
        });
        emailSent = !error;
        if (error) console.error("Author termination email error:", error);
      }
    } catch (e) { console.error("Author termination email failed:", e); }

    return NextResponse.json({ message: "Author and associated books removed from the website.", emailSent });
  } catch (e) {
    console.error("Delete author:", e);
    return NextResponse.json({ error: "Unable to delete author" }, { status: 500 });
  }
}