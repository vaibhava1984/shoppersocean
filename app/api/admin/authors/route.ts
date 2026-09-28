import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

export async function GET(){
 if(!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
 const db=getD1(); if(!db)return NextResponse.json({error:"Cloudflare database unavailable"},{status:503});
 const {results=[]}=await db.prepare("SELECT a.author_id,a.name,a.bio,a.user_id,a.created_at,a.updated_at,p.email FROM authors a LEFT JOIN profiles p ON p.id=a.user_id WHERE COALESCE(a.is_deleted,0)=0 ORDER BY a.name COLLATE NOCASE").all<any>();
 return NextResponse.json({authors:results});
}

export async function PATCH(request:Request){
 if(!(await requireAdmin())) return NextResponse.json({error:"Not allowed"},{status:403});
 const db=getD1(); if(!db)return NextResponse.json({error:"Cloudflare database unavailable"},{status:503});
 const {author_id,name,bio}=await request.json();
 if(!author_id||!name) return NextResponse.json({error:"Author name is required"},{status:400});
 await db.prepare("UPDATE authors SET name=?,bio=?,updated_at=? WHERE author_id=? AND COALESCE(is_deleted,0)=0").bind(String(name).trim(),String(bio??""),new Date().toISOString(),author_id).run();
 return NextResponse.json({message:"Author updated successfully"});
}
