import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";

export async function GET() {
  const db = getD1();
  if (!db) return NextResponse.json({ testimonials: [] });
  const result = await db.prepare(
    "SELECT description, users, rating, book_id FROM testimonials WHERE book_id IS NULL ORDER BY created_at DESC"
  ).all();
  return NextResponse.json({ testimonials: result.results || [] }, { headers: { "Cache-Control": "public, max-age=60" } });
}
