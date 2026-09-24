import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
export async function GET(){if(!(await requireAdmin()))return NextResponse.json({error:"Not allowed"},{status:403});const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database unavailable"},{status:503});const {results=[]}=await db.prepare("SELECT * FROM testimonials ORDER BY created_at DESC").all<any>();return NextResponse.json({reviews:results});}