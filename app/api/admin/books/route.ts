import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { getBooksBucket } from "@/utils/cloudflare/r2";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1(); if(!db) return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {results=[]}=await db.prepare(`SELECT b.*, a.name AS author_name FROM books b LEFT JOIN authors a ON a.author_id=b.author_id WHERE COALESCE(b.is_deleted,0)=0 ORDER BY b.updated_at DESC`).all<any>();
  return NextResponse.json({books:results});
}
export async function POST(req:Request) {
  if (!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1(); if(!db) return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const body=await req.json(); const id=body.id || crypto.randomUUID();
  const fields=["title","description","published_date","isbn","price","ratings","cover_images","binding","language","genre","publisher","pages","author_id","author_name","isCompletelyFilled"];
  const values=fields.map(k=>k==="cover_images" ? JSON.stringify(body[k] ?? []) : body[k] ?? null);
  if(body.id) {
    const set=fields.map(k=>`${k}=?`).join(",");
    await db.prepare(`UPDATE books SET ${set}, updated_at=datetime('now') WHERE id=?`).bind(...values,id).run();
  } else {
    await db.prepare(`INSERT INTO books (id,${fields.join(",")},updated_at,is_deleted) VALUES (?,${fields.map(()=>"?").join(",")},datetime('now'),0)`).bind(id,...values).run();
  }
  return NextResponse.json({success:true,id});
}
export async function DELETE(req:Request) {
  if (!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1(); if(!db) return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {id}=await req.json(); await db.prepare("UPDATE books SET is_deleted=1, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return NextResponse.json({success:true});
}