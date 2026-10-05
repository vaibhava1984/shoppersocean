import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const { name, user_id, bio } = await request.json();
    const authorName = String(name ?? "").trim();
    const userId = String(user_id ?? "").trim();
    if (!authorName || !userId) return NextResponse.json({ error: "Some Form fields are missing" }, { status: 400 });

    const user = await db.prepare("SELECT id FROM users WHERE id=? LIMIT 1").bind(userId).first();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.prepare(
      "INSERT INTO authors(id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)"
    ).bind(id,authorName,String(bio ?? ""),userId,0,now,now).run();

    return NextResponse.json({ message: "Author added successfully", author_id: id });
  } catch (e) {
    console.error("Add author:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
