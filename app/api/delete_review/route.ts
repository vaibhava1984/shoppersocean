import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
export async function POST(request:Request){
 try{if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});const {id}=await request.json();if(!id)return NextResponse.json({error:"Review ID is required."},{status:400});await db.prepare("DELETE FROM testimonials WHERE id=?").bind(id).run();return NextResponse.json({message:"Review deleted successfully"});}
 catch(e){console.error(e);return NextResponse.json({error:"Internal server error"},{status:500});}
}