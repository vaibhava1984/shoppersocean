import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const { results = [] } = await db.prepare(
      `SELECT
        t.id,t.content AS description,t.rating,t.user_id,t.book_id,t.created_at,t.updated_at,
        COALESCE(NULLIF(u.full_name,''),u.email,'Reader') AS users,
        b.title AS book_title
       FROM testimonials t
       LEFT JOIN users u ON u.id=t.user_id
       LEFT JOIN books b ON b.id=t.book_id
       ORDER BY t.created_at DESC`
    ).all<any>();

    return NextResponse.json({
      reviews: results.map((r) => ({
        ...r,
        id: String(r.id),
        description: r.description ?? "",
        users: r.users ?? "Reader",
        book_title: r.book_title ?? "",
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin reviews GET:", e);
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 });
  }
}
