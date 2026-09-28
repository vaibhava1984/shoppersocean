import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const rows = await db.prepare(
      "SELECT s.user_id, s.created_at, p.email FROM authors_interest_submission s LEFT JOIN profiles p ON p.id=s.user_id ORDER BY s.created_at DESC"
    ).all<Record<string, any>>();
    return NextResponse.json(rows.results.map((row) => ({
      user_id: row.user_id,
      created_at: row.created_at,
      profiles: { email: row.email || "" }
    })));
  } catch (error) {
    console.error("Error loading author approvals:", error);
    return NextResponse.json({ error: "Failed to load author approvals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const { author_id } = await request.json();
    if (!author_id) return NextResponse.json({ error: "Author ID is required" }, { status: 400 });

    const profile = await db.prepare("SELECT id FROM profiles WHERE id=? LIMIT 1").bind(author_id).first<any>();
    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await db.prepare(
      "SELECT author_id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
    ).bind(profile.id).first<any>();
    if (!existing) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.prepare(
        "INSERT INTO authors(author_id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)"
      ).bind(id, "-", "-", profile.id, 0, now, now).run();
    }
    await db.prepare("DELETE FROM authors_interest_submission WHERE user_id=?").bind(profile.id).run();
    return NextResponse.json({ message: "Author approved successfully" });
  } catch (error) {
    console.error("Error approving author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
