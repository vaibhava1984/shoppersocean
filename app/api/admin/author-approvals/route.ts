import { NextResponse } from "next/server"
import { firestore, firebaseAdminAuth } from "@/lib/firebase/admin"
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
  const snap=await firestore.collection("authors_interest_submission").orderBy("created_at","desc").get()
  const authors=await Promise.all(snap.docs.map(async d=>{
   const x:any=d.data(); let email=x.email
   if(!email&&x.user_id){try{email=(await firebaseAdminAuth.getUser(String(x.user_id))).email}catch{}}
   return {id:d.id,user_id:String(x.user_id||""),email:email||"",created_at:x.created_at||""}
  }))
  return NextResponse.json({authors},{headers:{"Cache-Control":"no-store"}})
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load author approvals."},{status:500})}
}