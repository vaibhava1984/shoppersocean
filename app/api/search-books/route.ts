import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
export async function GET(request:Request){
 try{
  const q=new URL(request.url).searchParams.get("q")?.trim()??""; if(q.length<2)return NextResponse.json({books:[]});
  const db=getD1(); if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const like=`%${q.replace(/[\\%_]/g,c=>"\\\\"+c)}%`;
  const {results=[]}=await db.prepare("SELECT id,title,author_name FROM books WHERE is_deleted=0 AND (title LIKE ? COLLATE NOCASE OR author_name LIKE ? COLLATE NOCASE) ORDER BY title ASC LIMIT 12").bind(like,like).all<{id:string,title:string,author_name:string}>();
  return NextResponse.json({books:results.map(b=>({id:b.id,title:b.title,author:b.author_name}))});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to search books"},{status:500});}
}
