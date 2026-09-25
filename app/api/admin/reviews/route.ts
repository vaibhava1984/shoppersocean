import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase/admin"
import { getFirebaseUser } from "@/lib/firebase/session"

async function admin(){
 const u:any=await getFirebaseUser(); if(!u)return null
 let role=u.userrole||u.role
 if(role!=="ADMIN"){const p=await firestore.collection("profiles").doc(u.uid).get();role=p.exists?p.data()?.userrole:role}
 return role==="ADMIN"?u:null
}
export async function GET(){
 try{
  if(!(await admin()))return NextResponse.json({error:"Not allowed"},{status:403})
  const snap=await firestore.collection("testimonials").orderBy("created_at","desc").get()
  return NextResponse.json({reviews:snap.docs.map(d=>({id:d.id,...d.data()}))},{headers:{"Cache-Control":"no-store"}})
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load reviews."},{status:500})}
}