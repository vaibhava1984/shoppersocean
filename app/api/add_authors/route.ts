import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function POST(request:Request){
 try{
  if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {name,user_id}=await request.json();
  if(!name||!user_id)return NextResponse.json({error:"Some Form fields are missing"},{status:400});
  const profile=await db.prepare("SELECT id FROM profiles WHERE id=? LIMIT 1").bind(user_id).first();
  if(!profile)return NextResponse.json({error:"User not found"},{status:404});
  const id=crypto.randomUUID(),now=new Date().toISOString();
  await db.prepare("INSERT INTO authors(author_id,name,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(id,String(name).trim(),user_id,0,now,now).run();
  return NextResponse.json({message:"Author approved successfully"});
 }catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}
