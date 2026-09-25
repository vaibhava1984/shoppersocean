import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";
import { storage } from "@/lib/firebase/admin";

async function authorize(){const user:any=await getFirebaseUser();const role=user?.userrole||user?.role;return user&&role==="ADMIN"}

export async function POST(request:Request){
 if(!(await authorize()))return NextResponse.json({error:"Not authorized"},{status:403});
 try{
  const form=await request.formData();const path=String(form.get("path")||"");const file=form.get("file");
  if(!path||!(file instanceof File))return NextResponse.json({error:"File and path are required"},{status:400});
  const buffer=Buffer.from(await file.arrayBuffer());
  await storage.bucket().file(path).save(buffer,{resumable:false,metadata:{contentType:file.type||"application/octet-stream"}});
  return NextResponse.json({success:true,path});
 }catch(error:any){return NextResponse.json({error:error?.message||"Upload failed"},{status:500})}
}

export async function DELETE(request:Request){
 if(!(await authorize()))return NextResponse.json({error:"Not authorized"},{status:403});
 try{
  const {paths}=await request.json();const list=Array.isArray(paths)?paths:[paths];
  await Promise.all(list.filter(Boolean).map((path:string)=>storage.bucket().file(path).delete({ignoreNotFound:true})));
  return NextResponse.json({success:true});
 }catch(error:any){return NextResponse.json({error:error?.message||"Delete failed"},{status:500})}
}
