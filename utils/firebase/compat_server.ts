import { cookies } from "next/headers"
import { firebaseAdminAuth } from "./server_admin"
import { firebaseAdminDb } from "./server_admin"

type Row = Record<string, any>

function project(rows: Row[], fields?: string) {
  if (!fields || fields.trim() === "*" || fields.includes("(")) return rows
  const names = fields.split(",").map(s => s.trim()).filter(Boolean)
  return rows.map(row => Object.fromEntries(names.map(k => [k, row[k]])))
}

class ServerQuery {
  private filters: Array<[string,string,any]> = []
  private search?: Array<{ field: string; value: string }>
  private sort?: {field:string; direction:"asc"|"desc"}
  private take?: number
  private offset=0
  private fields?: string
  constructor(private table:string){}
  select(fields="*", _options?:any){this.fields=fields;return this}
  eq(f:string,v:any){this.filters.push([f,"==",v]);return this}
  neq(f:string,v:any){this.filters.push([f,"!=",v]);return this}
  in(f:string,v:any[]){this.filters.push([f,"in",v]);return this}
  gte(f:string,v:any){this.filters.push([f,">=",v]);return this}
  gt(f:string,v:any){this.filters.push([f,">",v]);return this}
  lte(f:string,v:any){this.filters.push([f,"<=",v]);return this}
  lt(f:string,v:any){this.filters.push([f,"<",v]);return this}
  not(f:string,op:string,v:any){if(op==="is"&&v===null)this.filters.push([f,"!=",null]);return this}
  is(f:string,op:string,v:any){if(op==="null")this.filters.push([f,"==",null]);else if(op==="not_null")this.filters.push([f,"!=",null]);return this}
  match(v:Row){Object.entries(v).forEach(([k,x])=>this.eq(k,x));return this}
  or(expression:string){
    const match=expression.match(/^(\w+)\.ilike\.%(.+)%?,(\w+)\.ilike\.%(.+)%?$/)
    if(match)this.search=[{field:match[1],value:match[2].replace(/%$/,"")},{field:match[3],value:match[4].replace(/%$/,"")}]
    return this
  }
  order(f:string,o?:{ascending?:boolean}){this.sort={field:f,direction:o?.ascending===false?"desc":"asc"};return this}
  limit(n:number){this.take=n;return this}
  range(a:number,b:number){this.offset=a;this.take=Math.max(0,b-a+1);return this}
  async single(){const r=await this.execute();return{data:r.data?.[0]??null,error:r.data?.length===1?null:new Error("Expected exactly one row")}}
  async maybeSingle(){const r=await this.execute();return{data:r.data?.[0]??null,error:null}}
  async execute(){
    try{
      let q:any=firebaseAdminDb.collection(this.table)
      for(const [f,o,v] of this.filters) q=q.where(f,o as any,v)
      if(this.sort) q=q.orderBy(this.sort.field,this.sort.direction)
      if(this.take!==undefined) q=q.limit(this.offset+this.take)
      const snap=await q.get()
      let rows=snap.docs.map((d:any)=>({id:d.id,...d.data()})) as Row[]
      if(this.search?.length) rows=rows.filter(row=>this.search!.some(s=>String(row[s.field]??"").toLowerCase().includes(s.value.toLowerCase())))
      if(this.offset)rows=rows.slice(this.offset)
      if(this.take!==undefined)rows=rows.slice(0,this.take)
      return{data:project(rows,this.fields),error:null,count:rows.length}
    }catch(error:any){return{data:null,error:{message:error?.message||"Firestore query failed",code:error?.code},count:0}}
  }
  then(resolve:any,reject?:any){return this.execute().then(resolve,reject)}
}

class ServerMutation {
  private filters:Array<[string,string,any]>=[]
  constructor(private table:string,private action:"update"|"delete",private payload:Row){}
  eq(f:string,v:any){this.filters.push([f,"==",v]);return this}
  in(f:string,v:any[]){this.filters.push([f,"in",v]);return this}
  async execute(){
    try{
      let q:any=firebaseAdminDb.collection(this.table)
      for(const [f,o,v] of this.filters)q=q.where(f,o as any,v)
      const snap=await q.get()
      for(const d of snap.docs){if(this.action==="delete")await d.ref.delete();else await d.ref.update(this.payload)}
      return{data:null,error:null}
    }catch(error:any){return{data:null,error:{message:error?.message||"Mutation failed"}}}
  }
  then(resolve:any,reject?:any){return this.execute().then(resolve,reject)}
}

class ServerMutations {
  constructor(private table:string){}
  async insert(payload:Row|Row[]){try{const rows=Array.isArray(payload)?payload:[payload];const data=[];for(const row of rows){const ref=await firebaseAdminDb.collection(this.table).add(row);data.push({id:ref.id,...row})}return{data,error:null}}catch(error:any){return{data:null,error:{message:error?.message||"Insert failed"}}}}
  async upsert(payload:Row|Row[]){return this.insert(payload)}
  update(p:Row){return new ServerMutation(this.table,"update",p)}
  delete(){return new ServerMutation(this.table,"delete",{})}
}

async function authRequest(action:string, email:string, password:string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) return { error: { message: "Firebase API key is not configured" } }
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  })
  const json = await response.json()
  if (!response.ok) return { error: { message: json?.error?.message || "Authentication failed", code: json?.error?.message } }
  return { data: { user: { id: json.localId, uid: json.localId, email: json.email, email_verified: json.emailVerified }, session: { access_token: json.idToken } }, error: null }
}

export function createServerDataClient(){
  return {
    auth: {
      async getUser() {
        try {
          const store = await cookies()
          const token = store.get("session")?.value
          if (!token) return { data: { user: null }, error: null }
          const decoded:any = await firebaseAdminAuth.verifySessionCookie(token, true)
          return { data: { user: { id: decoded.uid, uid: decoded.uid, email: decoded.email ?? null, email_verified: decoded.email_verified ?? false, user_metadata: {}, app_metadata: {} } }, error: null }
        } catch { return { data: { user: null }, error: null } }
      },
      async signInWithPassword({ email, password }: any) {
        const result:any = await authRequest("signInWithPassword", email, password)
        if (!result.error) {
          const store = await cookies()
          const session = await firebaseAdminAuth.createSessionCookie(result.data.session.access_token, { expiresIn: 7 * 24 * 60 * 60 * 1000 })
          store.set("session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 })
        }
        return result
      },
      async signUp({ email, password, options }: any) {
        const result:any = await authRequest("signUp", email, password)
        if (!result.error) {
          try {
            const uid = result.data.user.uid
            await firebaseAdminDb.collection("profiles").doc(uid).set({ id: uid, email, full_name: options?.data?.full_name || "", country: options?.data?.country || "", address: options?.data?.address || "", mobile: options?.data?.mobile || "", created_at: new Date().toISOString() }, { merge: true })
            const session = await firebaseAdminAuth.createSessionCookie(result.data.session.access_token, { expiresIn: 7 * 24 * 60 * 60 * 1000 })
            const store = await cookies()
            store.set("session", session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 })
          } catch {}
        }
        return result
      },
      async signOut() {
        const store = await cookies()
        store.delete("session")
        return { error: null }
      }
    },
    from(table:string){
      const q=new ServerQuery(table)
      return {
        select:q.select.bind(q),eq:q.eq.bind(q),neq:q.neq.bind(q),in:q.in.bind(q),gte:q.gte.bind(q),gt:q.gt.bind(q),
        lte:q.lte.bind(q),lt:q.lt.bind(q),not:q.not.bind(q),is:q.is.bind(q),match:q.match.bind(q),or:q.or.bind(q),
        order:q.order.bind(q),limit:q.limit.bind(q),range:q.range.bind(q),single:q.single.bind(q),maybeSingle:q.maybeSingle.bind(q),
        insert:(p:any)=>new ServerMutations(table).insert(p),update:(p:any)=>new ServerMutations(table).update(p),
        delete:()=>new ServerMutations(table).delete(),upsert:(p:any)=>new ServerMutations(table).upsert(p)
      }
    }
  }
}
