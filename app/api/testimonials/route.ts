import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
export async function GET() {
  try {
    const db=getD1();
    if(!db) return NextResponse.json({testimonials:[]});
    const {results=[]}=await db.prepare("SELECT description, users, rating, book_id FROM testimonials WHERE book_id IS NULL ORDER BY created_at DESC").all<any>();
    return NextResponse.json({testimonials:results});
  } catch(e) {
    console.error(e);
    return NextResponse.json({error:"Failed to fetch testimonials"},{status:500});
  }
}