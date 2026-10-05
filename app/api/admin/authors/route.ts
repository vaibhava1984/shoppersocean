import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const { results = [] } = await db.prepare(
      `SELECT a.id,a.name,a.bio,a.photo_url,a.created_at,a.updated_at,
              a.user_id,u.email
       FROM authors a
       LEFT JOIN users u ON u.id=a.user_id
       WHERE COALESCE(a.is_deleted,0)=0
       ORDER BY a.created_at DESC`
    ).all<any>();

    return NextResponse.json({
      authors: results.map((a) => ({
        ...a,
        author_id: String(a.id),
        user_id: a.user_id ? String(a.user_id) : "",
        name: a.name ?? "",
        bio: a.bio ?? "",
        email: a.email ?? "",
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin authors GET:", e);
    return NextResponse.json({ error: "Unable to load authors" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const body = await request.json();
    const id = String(body.id ?? body.author_id ?? "").trim();
    const name = String(body.name ?? "").trim();
    if (!id || !name) return NextResponse.json({ error: "Author ID and name are required" }, { status: 400 });

    const result = await db.prepare(
      "UPDATE authors SET name=?,bio=?,updated_at=? WHERE id=? AND COALESCE(is_deleted,0)=0"
    ).bind(name, String(body.bio ?? ""), new Date().toISOString(), id).run();

    return NextResponse.json({ message: "Author updated successfully" });
  } catch (e) {
    console.error("Admin authors PATCH:", e);
    return NextResponse.json({ error: "Unable to update author" }, { status: 500 });
  }
}
