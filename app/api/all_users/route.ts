import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
export async function POST(){
 try{if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {results=[]}=await db.prepare("SELECT id,clerk_user_id,email,mobile,full_name,country,address,created_at,updated_at FROM profiles ORDER BY created_at DESC").all<any>();return NextResponse.json({users:results.map(u=>({id:u.clerk_user_id||u.id,email:u.email||"",phone:u.mobile||null,created_at:u.created_at,updated_at:u.updated_at,app_metadata:{},user_metadata:{full_name:u.full_name,country:u.country,address:u.address,mobile:u.mobile}}))});}
 catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}