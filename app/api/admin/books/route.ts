import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

async function isAdmin() {
  const user:any = await getFirebaseUser();
  if (!user) return false;
  if (user.userrole === "ADMIN" || user.role === "ADMIN") return true;
  const p = await firestore.collection("profiles").doc(user.uid).get();
  return p.exists && p.data()?.userrole === "ADMIN";
}
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({error:"Not authorized"},{status:403});
  const [booksSnap, authorsSnap] = await Promise.all([
    firestore.collection("books").get(),
    firestore.collection("authors").where("is_deleted","==",false).get()
  ]);
  const authors = new Map(authorsSnap.docs.map(d=>[d.id,d.data()]));
  const books = booksSnap.docs.filter(d=>d.data()?.is_deleted !== true).map(d=>{
    const b:any={id:d.id,...d.data()}; const a:any=authors.get(String(b.author_id));
    return {...b, authors:a?{author_id:a.author_id||d.id,name:a.name}:null};
  }).sort((a:any,b:any)=>String(a.title||"").localeCompare(String(b.title||"")));
  return NextResponse.json({books,authors:Array.from(authorsSnap.docs).map(d=>({author_id:d.data().author_id||d.id,name:d.data().name||""})).sort((a,b)=>a.name.localeCompare(b.name))});
}
export async function POST(req:Request){
  if (!(await isAdmin())) return NextResponse.json({error:"Not authorized"},{status:403});
  const body:any=await req.json(); if(!body.title||!body.author_id) return NextResponse.json({error:"Title and author are required"},{status:400});
  const ref=firestore.collection("books").doc(); const now=new Date().toISOString();
  await ref.set({...body,id:ref.id,is_deleted:false,created_at:now,updated_at:now});
  return NextResponse.json({id:ref.id});
}
export async function PATCH(req:Request){
  if (!(await isAdmin())) return NextResponse.json({error:"Not authorized"},{status:403});
  const body:any=await req.json(); const id=String(body.id||""); delete body.id; if(!id) return NextResponse.json({error:"Book id required"},{status:400});
  await firestore.collection("books").doc(id).update({...body,updated_at:new Date().toISOString()});
  return NextResponse.json({success:true});
}
export async function DELETE(req:Request){
  if (!(await isAdmin())) return NextResponse.json({error:"Not authorized"},{status:403});
  const {id}=await req.json(); if(!id) return NextResponse.json({error:"Book id required"},{status:400});
  await firestore.collection("books").doc(String(id)).update({is_deleted:true,updated_at:new Date().toISOString()});
  return NextResponse.json({success:true});
}