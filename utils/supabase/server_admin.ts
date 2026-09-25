import { firebaseAdminApp, firebaseAdminAuth, firestore, storage } from "@/lib/firebase/admin"
export function createAdminClient(){return {
 auth:{getUser:async()=>{const u=await (await import("@/lib/firebase/session")).getFirebaseUser();return {data:{user:u?{id:u.uid,email:u.email,app_metadata:{userrole:(u as any).userrole || (u as any).role || "USER",isAuthor:(u as any).isAuthor}:null}},error:null}}},
 from:(name:string)=>{const {createClient}=require("./server");return createClient().from(name)},
 storage:{from:()=>({})}
}}
export { firebaseAdminApp, firebaseAdminAuth, firestore, storage }
