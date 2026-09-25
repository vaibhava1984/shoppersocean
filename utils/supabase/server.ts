import { cache } from "react"
import { getFirebaseUser } from "@/lib/firebase/session"

type QueryResult<T=any> = { data: T; error: any; count?: number | null }

class FirebaseQuery {
  private ref: any
  private ops: any[] = []
  private action: "select"|"insert"|"update"|"delete" = "select"
  private payload: any
  private filters: any[] = []
  private selected: string | null = null
  constructor(collection: string) { this.ref = require("firebase-admin/firestore").getFirestore().collection(collection) }
  select(columns="*") { this.selected = columns; this.action="select"; return this }
  eq(field:string,value:any){this.filters.push({type:"eq",field,value});return this}
  in(field:string,values:any[]){this.filters.push({type:"in",field,values});return this}
  not(field:string,op:string,value:any){this.filters.push({type:"not",field,op,value});return this}
  order(field:string,opts:any={}){this.ops.push({type:"order",field,direction:opts.ascending===false?"desc":"asc"});return this}
  limit(n:number){this.ops.push({type:"limit",n});return this}
  gte(field:string,value:any){this.filters.push({type:"gte",field,value});return this}
  range(from:number,to:number){this.ops.push({type:"range",from,to});return this}
  or(expr:string){this.filters.push({type:"or",expr});return this}
  single(){this.ops.push({type:"single"});return this}
  maybeSingle(){this.ops.push({type:"maybeSingle"});return this}
  insert(rows:any[]|any){this.action="insert";this.payload=rows;return this}
  update(data:any){this.action="update";this.payload=data;return this}
  delete(){this.action="delete";return this}
  async execute():Promise<QueryResult>{
    try{
      if(this.action==="insert"){
        const rows=Array.isArray(this.payload)?this.payload:[this.payload], out:any[]=[];
        for(const row of rows){const ref=row.id ? this.ref.doc(row.id) : this.ref.doc();const data={...row,id:ref.id};await ref.set(data,{merge:true});out.push(data)}
        return {data:out,error:null}
      }
      if(this.action==="update"||this.action==="delete"){
        const snap=await this.getSnapshot();for(const d of snap.docs){await d.ref[this.action==="delete"?"delete":"set"](this.action==="delete"?undefined:this.payload,{merge:true})}
        return {data:null,error:null}
      }
      const orFilter=this.filters.find((f:any)=>f.type==="or");
      const normalFilters=this.filters.filter((f:any)=>f.type!=="or");
      let q:any=this.ref;
      for(const f of normalFilters){
        if(f.type==="eq") q=q.where(f.field,"==",f.value);
        else if(f.type==="in") q=q.where(f.field,"in",f.values);
        else if(f.type==="gte") q=q.where(f.field,">=",f.value);
        else if(f.type==="not" && f.op==="is" && f.value===null) q=q.where(f.field,"!=",null);
      }
      for(const op of this.ops) if(op.type==="order") q=q.orderBy(op.field,op.direction);
      if(orFilter){
        const alternatives=String(orFilter.expr).split(",").map((part:string)=>{
          const m=part.match(/^([^\.]+)\.(eq|is)\.(.*)$/); return m?{field:m[1],op:m[2],value:m[3]==="null"?null:m[3]}:null;
        }).filter(Boolean) as any[];
        if(alternatives.length){
          const baseSnap=await this.ref.get();
          let docs=baseSnap.docs.filter((d:any)=>alternatives.some((a:any)=>{
            const v=d.data()?.[a.field]; return a.op==="eq"?String(v)===a.value:(a.value===null?(v===null||v===undefined):v===a.value);
          }));
          for(const f of normalFilters) if(f.type==="eq") docs=docs.filter((d:any)=>d.data()?.[f.field]===f.value);
          if(normalFilters.some((f:any)=>f.type==="gte")) docs=docs.filter((d:any)=>normalFilters.filter((f:any)=>f.type==="gte").every((f:any)=>d.data()?.[f.field]>=f.value));
          let data=docs.map((d:any)=>({id:d.id,...d.data()}));
          if(this.ops.some((o:any)=>o.type==="order")){const o=this.ops.find((x:any)=>x.type==="order");data.sort((a:any,b:any)=>String(a[o.field]??"").localeCompare(String(b[o.field]??""))*(o.direction==="desc"?-1:1))}
          const lim=this.ops.find((o:any)=>o.type==="limit"); if(lim)data=data.slice(0,lim.n);
          return {data,error:null,count:data.length};
        }
      }
      for(const op of this.ops) if(op.type==="limit") q=q.limit(op.n);
      for(const op of this.ops) if(op.type==="range") q=q.offset(op.from).limit(op.to-op.from+1);
      const snap=await q.get(); let data=snap.docs.map((d:any)=>({id:d.id,...d.data()}));
      const single=this.ops.some(o=>o.type==="single"||o.type==="maybeSingle");
      if(single){if(!data.length)return {data:null,error:this.ops.some(o=>o.type==="single")?new Error("No rows"):null};data=data[0]}
      return {data,error:null,count:snap.size}
    }catch(error){return {data:null,error}}
  }
  private async getSnapshot(){let q:any=this.ref;for(const f of this.filters)if(f.type==="eq")q=q.where(f.field,"==",f.value);else if(f.type==="in")q=q.where(f.field,"in",f.values);else if(f.type==="gte")q=q.where(f.field,">=",f.value);for(const op of this.ops)if(op.type==="order")q=q.orderBy(op.field,op.direction);for(const op of this.ops)if(op.type==="limit")q=q.limit(op.n);for(const op of this.ops)if(op.type==="range")q=q.offset(op.from).limit(op.to-op.from+1);return q.get()}
  then(resolve:any,reject?:any){return this.execute().then(resolve,reject)}
}

function makeAuth(){
  return {
    async getUser(){const user=await getFirebaseUser();let profile:any=null;if(user){try{const snap=await require("@/lib/firebase/admin").firestore.collection("profiles").doc(user.uid).get();profile=snap.exists?snap.data():null}catch{}}return {data:{user:user?{id:user.uid,email:user.email,phone:user.phone_number||profile?.mobile||null,app_metadata:{userrole:(user as any).userrole || (user as any).role || profile?.userrole || "USER",isAuthor:Boolean((user as any).isAuthor||profile?.isAuthor)},user_metadata:{full_name:profile?.full_name||user.name||"",country:profile?.country||"",address:profile?.address||"",mobile:profile?.mobile||user.phone_number||""}}:null},error:null}},
    async getSession(){const user=await getFirebaseUser();return {data:{session:user?{user:{id:user.uid,email:user.email}}:null},error:null}},
    async signOut(){return {error:null}},
    async updateUser(data:any){const user=await getFirebaseUser();if(!user)return {error:new Error("Not authorized")};const {firebaseAdminAuth}=require("@/lib/firebase/admin");await firebaseAdminAuth.updateUser(user.uid,{password:data.password,email:data.email,phoneNumber:data.phone});return {error:null}},
  }
}

export function createClient(){return {from:(name:string)=>new FirebaseQuery(name),auth:makeAuth(),storage:{from:()=>({createSignedUrl:async()=>({data:null,error:new Error("Storage migration pending")})})}}}
export const getUser=cache(async()=>{const {data}=await makeAuth().getUser();return data.user})
