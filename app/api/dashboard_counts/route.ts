import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function POST() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db=getD1(); if(!db) return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
    const [books,authors,profiles]=await Promise.all([
      db.prepare("SELECT COUNT(*) AS count FROM books WHERE is_deleted = 0").first<{count:number}>(),
      db.prepare("SELECT COUNT(*) AS count FROM authors WHERE is_deleted = 0").first<{count:number}>(),
      db.prepare("SELECT COUNT(*) AS count FROM profiles").first<{count:number}>(),
    ]);
    return NextResponse.json({booksCount:books?.count??0,authorsCount:authors?.count??0,profilesCount:profiles?.count??0});
  } catch(e){ console.error(e); return NextResponse.json({error:"Internal server error"},{status:500}); }
}
