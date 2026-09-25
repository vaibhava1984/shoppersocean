"use client"

import { getFirebaseApp } from "@/lib/firebase/client"
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, confirmPasswordReset, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, collection, query, where, orderBy, limit as firestoreLimit, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore"

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
 not(field:string,_op:string,value:any){this.filters.push({field,value,not:true});return this}
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
   for(const f of this.filters){if(f.values)q=query(q,where(f.field,"in",f.values));else q=query(q,where(f.field,f.op|| (f.not?"!=":"=="),f.value))}
   if(this.orderSpec)q=query(q,orderBy(this.orderSpec.field,this.orderSpec.direction));
   if(this.lim)q=query(q,firestoreLimit(this.lim));

   if(this.action==="select"){
    const snap=await getDocs(q);let data=snap.docs.map(d=>({id:d.id,...d.data()}));
    if((this as any)._range){const {from,to}=(this as any)._range;data=data.slice(from,to+1);}
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
   signInWithPassword:async({email,password}:{email:string,password:string})=>{
    try{
      const credential=await signInWithEmailAndPassword(auth,email,password)
      const idToken=await credential.user.getIdToken(true)
      const response=await fetch("/api/auth/session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({idToken})})
      if(!response.ok) return {data:{user:null,session:null},error:new Error("Unable to create secure session")}
      return {data:{user:credential.user,session:{user:credential.user}},error:null}
    }catch(error:any){
      const mapped=String(error?.code||"")
      const e:any=new Error(mapped.includes("invalid-credential")||mapped.includes("wrong-password")||mapped.includes("user-not-found")?"Invalid credentials":error?.message||"Unable to sign in")
      e.code=mapped.includes("invalid-credential")||mapped.includes("wrong-password")||mapped.includes("user-not-found")?"invalid_credentials":mapped
      return {data:{user:null,session:null},error:e}
    }
   },
   getUser:async()=>({data:{user:await currentUser()},error:null}),
   getSession:async()=>{const user=await currentUser();return {data:{session:user?{user}:null},error:null}},
   signOut:async()=>{try{await fetch("/api/auth/session",{method:"DELETE"});await firebaseSignOut(auth)}catch{}return {error:null}},
   refreshSession:async()=>({data:{session:(await currentUser())?{user:await currentUser()}:null},error:null}),
   updateUser:async(data:any)=>{const response=await fetch("/api/update-profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});return {error:response.ok?null:new Error("Unable to update profile")}},
   resetPasswordForEmail:async(email:string,_options?:any)=>{try{const response=await fetch("/api/auth/password-reset",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email})});const data=await response.json();return {error:response.ok?null:new Error(data.error||"Unable to send reset email")}}catch(error){return {error}}},
   confirmPasswordReset:async(oobCode:string,password:string)=>{try{await confirmPasswordReset(auth,oobCode,password);return {error:null}}catch(error:any){return {error}}},
   verifyPasswordResetCode:async(oobCode:string)=>{try{const {verifyPasswordResetCode}=await import("firebase/auth");const email=await verifyPasswordResetCode(auth,oobCode);return {data:email,error:null}}catch(error){return {data:null,error}}},
   verifyOtp:async()=>({error:new Error("Phone verification is not used.")}),
   onAuthStateChange:(callback:(event:string,session:any)=>void)=>{let active=true;currentUser().then(user=>{if(active)callback("INITIAL_SESSION",user?{user}:null)});const unsub=onAuthStateChanged(auth,()=>{});return {data:{subscription:{unsubscribe:()=>{active=false;unsub()}}}}}
  },
  storage:{
   from:(bucket:string)=>({
    upload:async(path:string,file:File,_options?:any)=>{try{const form=new FormData();form.append("path",path);form.append("file",file);const r=await fetch("/api/storage/books-content",{method:"POST",body:form});const d=await r.json();return {data:r.ok?{path}:null,error:r.ok?null:new Error(d.error||"Upload failed")}}catch(error){return {data:null,error}}},
    remove:async(paths:string[])=>{try{const r=await fetch("/api/storage/books-content",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({paths})});const d=await r.json();return {data:r.ok?paths:null,error:r.ok?null:new Error(d.error||"Delete failed")}}catch(error){return {data:null,error}}}
   })
  }
 }
}
