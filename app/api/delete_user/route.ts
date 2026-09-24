import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
export async function POST(request:Request){
 try{if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {author_id,user_id}=await request.json();if(!user_id||!author_id)return NextResponse.json({error:"Some Form fields are missing"},{status:400});const book=await db.prepare("SELECT id FROM books WHERE author_id=? LIMIT 1").bind(author_id).first();if(book)return NextResponse.json({error:"Please delete the books associated with this author."},{status:500});await db.prepare("DELETE FROM authors WHERE author_id=?").bind(author_id).run();try{const client=await clerkClient();const u=await client.users.getUser(user_id);await client.users.updateUserMetadata(user_id,{publicMetadata:{...(u.publicMetadata||{}),isAuthor:false}});}catch(e){console.error(e);return NextResponse.json({error:"Failed to delete user claim"},{status:500});}return NextResponse.json({message:"Author deleted successfully"});}
 catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}