import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const { results = [] } = await db
      .prepare("SELECT description, users, rating, book_id FROM testimonials WHERE book_id IS NULL ORDER BY created_at DESC")
      .all<any>();
    return NextResponse.json({ testimonials: results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Testimonials fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
