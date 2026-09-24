import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireClerkUser } from "@/utils/auth/requireUser";

export async function GET(request:Request){
 try{const bookId=new URL(request.url).searchParams.get("bookId");if(!bookId)return NextResponse.json({error:"Book ID is required."},{status:400});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {results=[]}=await db.prepare("SELECT id,description,rating,users,user_id,book_id,created_at FROM testimonials WHERE book_id=? ORDER BY created_at DESC").bind(bookId).all<any>();return NextResponse.json({reviews:results},{headers:{"Cache-Control":"no-store"}});}
 catch(e){console.error(e);return NextResponse.json({error:"Unable to fetch reviews."},{status:500});}
}
export async function POST(request:Request){
 try{
  const identity=await requireClerkUser();if(!identity)return NextResponse.json({error:"Please sign in to write a review."},{status:401});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const {bookId,description,rating}=await request.json();const text=String(description??"").trim();const stars=Number(rating);
  if(!bookId||!text||!Number.isInteger(stars)||stars<1||stars>5)return NextResponse.json({error:"Please provide a review and a rating from 1 to 5."},{status:400});
  const book=await db.prepare("SELECT id FROM books WHERE id=? AND is_deleted=0 LIMIT 1").bind(bookId).first();if(!book)return NextResponse.json({error:"Book not found."},{status:404});
  const userId=String(identity.profile.id);const existing=await db.prepare("SELECT id FROM testimonials WHERE book_id=? AND user_id=? LIMIT 1").bind(String(bookId),userId).first();if(existing)return NextResponse.json({error:"You have already reviewed this book."},{status:409});
  const name=String((identity.profile as any).full_name||identity.user.firstName||identity.user.emailAddresses?.[0]?.emailAddress||"Reader");
  const inserted=await db.prepare("INSERT INTO testimonials(description,rating,users,user_id,book_id,created_at) VALUES(?,?,?,?,?,?) RETURNING id,description,rating,users,user_id,book_id,created_at").bind(text,stars,name,userId,String(bookId),new Date().toISOString()).first<any>();
  return NextResponse.json({message:"Review submitted successfully.",review:inserted},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to submit your review."},{status:500});}
}