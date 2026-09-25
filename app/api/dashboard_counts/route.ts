import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase/admin"
import { getFirebaseUser } from "@/lib/firebase/session"

export async function POST(){
 try{
  const u:any=await getFirebaseUser(); if(!u)return NextResponse.json({error:"Authentication required"},{status:401})
  let role=u.userrole||u.role
  if(role!=="ADMIN"){const p=await firestore.collection("profiles").doc(u.uid).get();role=p.exists?p.data()?.userrole:role}
  if(role!=="ADMIN")return NextResponse.json({error:"Not allowed"},{status:403})
  const [books,authors,profiles]=await Promise.all([
   firestore.collection("books").where("is_deleted","==",false).get(),
   firestore.collection("authors").where("is_deleted","==",false).get(),
   firestore.collection("profiles").get()
  ])
  return NextResponse.json({booksCount:books.size,authorsCount:authors.size,profilesCount:profiles.size},{status:200,headers:{"Cache-Control":"no-store"}})
 }catch(error){console.error("Unexpected error:",error);return NextResponse.json({error:"Internal server error"},{status:500})}
}