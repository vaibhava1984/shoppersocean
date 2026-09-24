import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
export async function POST(request:Request){
 try{if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {name,user_id}=await request.json();if(!name||!user_id)return NextResponse.json({error:"Some Form fields are missing"},{status:400});const id=crypto.randomUUID();await db.prepare("INSERT INTO authors(author_id,name,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(id,name,user_id,0,new Date().toISOString(),new Date().toISOString()).run();try{const client=await clerkClient();const u=await client.users.getUser(user_id);await client.users.updateUserMetadata(user_id,{publicMetadata:{...(u.publicMetadata||{}),isAuthor:true}});}catch(e){console.error(e);await db.prepare("DELETE FROM authors WHERE author_id=?").bind(id).run();return NextResponse.json({error:"Failed to update user status"},{status:500});}return NextResponse.json({message:"Author approved successfully"});}
 catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}