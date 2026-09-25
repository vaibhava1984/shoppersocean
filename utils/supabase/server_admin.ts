import { firebaseAdminApp, firebaseAdminAuth, firestore, storage } from "@/lib/firebase/admin"
export function createAdminClient(){return {
 auth:{
  getUser:async()=>{const u=await (await import("@/lib/firebase/session")).getFirebaseUser();return {data:{user:u?{id:u.uid,email:u.email,app_metadata:{userrole:(u as any).userrole || (u as any).role || "USER",isAuthor:(u as any).isAuthor}:null}},error:null}},
  admin:{listUsers:async({page=1,perPage=1000}:{page?:number,perPage?:number}={})=>{const result=await firebaseAdminAuth.listUsers(Math.min(perPage,1000),(page-1)*Math.min(perPage,1000));return {data:{users:result.users.map(u=>({id:u.uid,email:u.email,phone:u.phoneNumber,created_at:u.metadata.creationTime,updated_at:u.metadata.lastRefreshTime||u.metadata.lastSignInTime,app_metadata:u.customClaims||{},user_metadata:{full_name:u.displayName||"",email:u.email||""},confirmed_at:u.emailVerified?u.metadata.creationTime:undefined,last_sign_in_at:u.metadata.lastSignInTime}) )},error:null}}}
 },
 from:(name:string)=>{const {createClient}=require("./server");return createClient().from(name)},
 storage:{from:()=>({})}
}}
export { firebaseAdminApp, firebaseAdminAuth, firestore, storage }
