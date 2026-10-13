import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

const SECTION_TYPES=["HOMEPAGE_TRENDING","HOMEPAGE_COLLECTION","HS"] as const;
type SectionType=(typeof SECTION_TYPES)[number];
const valid=(v:unknown):v is SectionType=>typeof v==="string"&&SECTION_TYPES.includes(v as SectionType);

export async function GET(request:Request){
 try{
  if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const search=new URL(request.url).searchParams.get("search")?.trim()??"";
  if(search.length>=2){
   const like=`%${search.replace(/[\\%_]/g,c=>"\\\\"+c)}%`;
   const {results=[]}=await db.prepare("SELECT id,title,author_name FROM books WHERE is_deleted=0 AND (title LIKE ? COLLATE NOCASE OR author_name LIKE ? COLLATE NOCASE) ORDER BY title ASC LIMIT 15").bind(like,like).all<any>();
   return NextResponse.json({books:results.map(b=>({id:b.id,title:b.title,author:b.author_name}))});
  }
  const {results:layout=[]}=await db.prepare("SELECT id,page_section,value FROM layout_settings ORDER BY id ASC").all<any>();
  const ids=layout.map(x=>x.value).filter(Boolean);
  const books=ids.length?(await db.prepare(`SELECT id,title,author_name,is_deleted FROM books WHERE id IN (${ids.map(()=>"?").join(",")})`).bind(...ids).all<any>()).results:[];
  const byId=new Map(books.map(b=>[String(b.id),b]));
  return NextResponse.json({sections:layout.map(x=>{const b=byId.get(String(x.value));return {entryId:x.id,pageSection:x.page_section,id:x.value,title:b?.title??null,author:b?.author_name??null,missing:!b||b.is_deleted===1};})});
 }catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}
export async function POST(request:Request){
 try{
  if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {pageSection,bookId}=await request.json();
  if(!valid(pageSection)||!bookId)return NextResponse.json({error:"Invalid section or book"},{status:400});
  const book=await db.prepare("SELECT id,title,author_name,is_deleted FROM books WHERE id=? LIMIT 1").bind(bookId).first<any>();
  if(!book)return NextResponse.json({error:"Book not found"},{status:404});
  if(book.is_deleted)return NextResponse.json({error:"This book has been deleted"},{status:400});
  const existing=await db.prepare("SELECT id FROM layout_settings WHERE page_section=? AND value=? LIMIT 1").bind(pageSection,bookId).first();
  if(existing)return NextResponse.json({error:"Book is already in this section"},{status:409});
  const max=pageSection==="HOMEPAGE_TRENDING"?8:pageSection==="HOMEPAGE_COLLECTION"?8:null;
  if(max!==null){const count=await db.prepare("SELECT COUNT(*) AS count FROM layout_settings WHERE page_section=?").bind(pageSection).first<any>();if((count?.count??0)>=max)return NextResponse.json({error:`This section is full. Maximum ${max} books allowed.`},{status:409});}
  const inserted=await db.prepare("INSERT INTO layout_settings(page_section,value) VALUES(?,?) RETURNING id").bind(pageSection,bookId).first<any>();
  return NextResponse.json({entry:{entryId:inserted?.id,pageSection,id:book.id,title:book.title,author:book.author_name,missing:false}});
 }catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}
export async function PATCH(request:Request){
 try{
  if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {entryId,direction}=await request.json();
  if(!entryId||!["up","down"].includes(direction))return NextResponse.json({error:"Invalid priority change"},{status:400});
  const current=await db.prepare("SELECT id,page_section,value FROM layout_settings WHERE id=? AND page_section IN ('HOMEPAGE_TRENDING','HOMEPAGE_COLLECTION') LIMIT 1").bind(entryId).first<any>();
  if(!current)return NextResponse.json({error:"Book placement not found"},{status:404});
  const neighbor=direction==="up"
   ? await db.prepare("SELECT id,value FROM layout_settings WHERE page_section=? AND id<? ORDER BY id DESC LIMIT 1").bind(current.page_section,current.id).first<any>()
   : await db.prepare("SELECT id,value FROM layout_settings WHERE page_section=? AND id>? ORDER BY id ASC LIMIT 1").bind(current.page_section,current.id).first<any>();
  if(!neighbor)return NextResponse.json({message:"Already at the requested priority"});
  // The homepage reads entries in id order, so swap the row IDs—not their book values.
  // A temporary unused ID prevents a primary-key collision; D1 batch applies the swap atomically.
  const maximum=await db.prepare("SELECT COALESCE(MAX(id),0) AS maxId FROM layout_settings").first<any>();
  const temporaryId=Number(maximum?.maxId??0)+1;
  await db.batch([
   db.prepare("UPDATE layout_settings SET id=? WHERE id=?").bind(temporaryId,current.id),
   db.prepare("UPDATE layout_settings SET id=? WHERE id=?").bind(current.id,neighbor.id),
   db.prepare("UPDATE layout_settings SET id=? WHERE id=?").bind(neighbor.id,temporaryId)
  ]);
  return NextResponse.json({message:"Display priority updated"});
 }catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}
export async function DELETE(request:Request){
 try{if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {entryId}=await request.json();if(!entryId)return NextResponse.json({error:"Missing entry id"},{status:400});await db.prepare("DELETE FROM layout_settings WHERE id=?").bind(entryId).run();return NextResponse.json({message:"Book removed successfully"});}catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}
