"use client"

import { getFirebaseApp } from "@/lib/firebase/client"
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth"
import { getFirestore, collection, query, where, orderBy, limit as firestoreLimit, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"

const app=getFirebaseApp()
const auth=getAuth(app)
const db=getFirestore(app)

async function currentUser(){
 try{
   const response=await fetch("/api/auth/me",{cache:"no-store"})
   const data=await response.json()
   return data.user || null
 }catch{return null}
}

class ClientQuery{
 private name:string; private filters:any[]=[]; private orderSpec:any; private lim:number|undefined; private action="select"; private payload:any;
 constructor(name:string){this.name=name}
 select(_columns="*"){this.action="select";return this}
 eq(field:string,value:any){this.filters.push({field,value});return this}
 in(field:string,values:any[]){this.filters.push({field,values});return this}
 order(field:string,opts:any={}){this.orderSpec={field,direction:opts.ascending===false?"desc":"asc"};return this}
 limit(n:number){this.lim=n;return this}
 single(){(this as any)._single=true;return this}
 maybeSingle(){(this as any)._maybe=true;return this}
 insert(rows:any[]|any){this.action="insert";this.payload=rows;return this}
 update(data:any){this.action="update";this.payload=data;return this}
 delete(){this.action="delete";return this}
 async execute(){
  try{
   const base=collection(db,this.name); let q:any=base;
   for(const f of this.filters){if(f.values)q=query(q,where(f.field,"in",f.values));else q=query(q,where(f.field,"==",f.value))}
   if(this.orderSpec)q=query(q,orderBy(this.orderSpec.field,this.orderSpec.direction));
   if(this.lim)q=query(q,firestoreLimit(this.lim));
   if(this.action==="select"){
    const snap=await getDocs(q);let data=snap.docs.map(d=>({id:d.id,...d.data()}));
    if((this as any)._single||(this as any)._maybe){if(!data.length)return {data:null,error:(this as any)._single?new Error("No rows"):null};data=data[0]}
    return {data,error:null,count:snap.size}
   }
   const refs=(await getDocs(q)).docs;
   if(this.action==="insert"){const rows=Array.isArray(this.payload)?this.payload:[this.payload];const out=[];for(const row of rows){const ref=await addDoc(base,row);out.push({id:ref.id,...row})}return {data:out,error:null}}
   for(const ref of refs){if(this.action==="update")await updateDoc(ref,this.payload);else await deleteDoc(ref.ref)}
   return {data:null,error:null}
  }catch(error){return {data:null,error}}
 }
 then(resolve:any,reject?:any){return this.execute().then(resolve,reject)}
}

export function createClient(){
 return {
  from:(name:string)=>new ClientQuery(name),
  auth:{
   getUser:async()=>({data:{user:await currentUser()},error:null}),
   getSession:async()=>{const user=await currentUser();return {data:{session:user?{user}:null},error:null}},
   signOut:async()=>{try{await fetch("/api/auth/session",{method:"DELETE"});await firebaseSignOut(auth)}catch{}return {error:null}},
   updateUser:async(data:any)=>{const response=await fetch("/api/update-profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});return {error:response.ok?null:new Error("Unable to update profile")}},
   onAuthStateChange:(callback:(event:string,session:any)=>void)=>{let active=true;currentUser().then(user=>{if(active)callback("INITIAL_SESSION",user?{user}:null)});const unsub=onAuthStateChanged(auth,()=>{});return {data:{subscription:{unsubscribe:()=>{active=false;unsub()}}}}}
  }
 }
}
