import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { getBooksBucket } from "@/utils/cloudflare/r2";

export async function GET(req:Request) {
  if(!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const bookId=new URL(req.url).searchParams.get("bookId"); if(!bookId) return NextResponse.json({files:[]});
  const db=getD1(); if(!db) return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {results=[]}=await db.prepare("SELECT id,file_path,file_name,file_type FROM private_book_files WHERE book_id=? ORDER BY created_at DESC").bind(bookId).all<any>();
  return NextResponse.json({files:results});
}
export async function POST(req:Request) {
  if(!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1(), bucket=getBooksBucket(); if(!db||!bucket) return NextResponse.json({error:"Cloudflare storage is unavailable"},{status:503});
  const form=await req.formData(); const bookId=String(form.get("bookId")||""); const files=form.getAll("file").filter(v=>v instanceof File) as File[];
  if(!bookId||!files.length) return NextResponse.json({error:"Book and file are required"},{status:400});
  const created:any[]=[];
  for(const file of files){
    const ext=(file.name.split(".").pop()||"").toLowerCase(); const key=`protected-books/${crypto.randomUUID()}.${ext}`;
    await bucket.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type||"application/octet-stream"}});
    const id=crypto.randomUUID();
    await db.prepare("INSERT INTO private_book_files (id,book_id,file_path,file_name,file_type,created_at,updated_at) VALUES (?,?,?,?,?,datetime('now'),datetime('now'))").bind(id,bookId,key,file.name,ext).run();
    created.push({id,file_path:key,file_name:file.name,file_type:ext});
  }
  await db.prepare("UPDATE books SET isCompletelyFilled=1,updated_at=datetime('now') WHERE id=?").bind(bookId).run();
  return NextResponse.json({files:created});
}
export async function DELETE(req:Request) {
  if(!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1(),bucket=getBooksBucket(); if(!db||!bucket) return NextResponse.json({error:"Cloudflare storage is unavailable"},{status:503});
  const {id,filePath}=await req.json(); if(filePath) await bucket.delete(String(filePath));
  await db.prepare("DELETE FROM private_book_files WHERE id=?").bind(id).run();
  return NextResponse.json({success:true});
}