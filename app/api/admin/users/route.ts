import { NextResponse } from "next/server";
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

async function isAdmin(){
 const u:any=await getFirebaseUser(); if(!u)return false;
 let role=u.userrole||u.role;
 if(role!=="ADMIN"){const p=await firestore.collection("profiles").doc(u.uid).get();role=p.exists?p.data()?.userrole:role;}
 return role==="ADMIN";
}
export async function GET(){
 try{
  if(!(await isAdmin()))return NextResponse.json({error:"Not authorized"},{status:403});
  const profiles=await firestore.collection("profiles").get();
  const users=await Promise.all(profiles.docs.map(async d=>{
   const p:any=d.data(); let auth:any=null;
   try{auth=await firebaseAdminAuth.getUser(d.id)}catch{}
   return {id:d.id,email:auth?.email||p.email||"",full_name:p.full_name||auth?.displayName||"",mobile:p.mobile||auth?.phoneNumber||"",userrole:p.userrole||auth?.customClaims?.userrole||"USER"};
  }));
  return NextResponse.json({users});
 }catch{ return NextResponse.json({error:"Unable to load users"},{status:500});}
}