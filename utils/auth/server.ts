import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const COOKIE = "so_session";
const SESSION_TTL = 60 * 60 * 24 * 30;
type User = { id: string; email: string; full_name?: string|null; country?: string|null; phone?: string|null; address?: string|null; role?: string|null };

function secret() { const env = getCloudflareContext().env as { AUTH_SECRET?: string }; return env.AUTH_SECRET || process.env.AUTH_SECRET || "shoppers-ocean-local-secret-change-me"; }
function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }

async function hmac(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  return bytesToBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
async function hashPassword(password: string, salt = crypto.randomUUID()) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:120000,hash:"SHA-256"}, key, 256);
  return `pbkdf2$120000$${salt}$${bytesToBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string) {
  const parts=stored.split("$"); if(parts.length!==4||parts[0]!=="pbkdf2") return false;
  return (await hashPassword(password,parts[2]))===stored;
}
export async function createSession(userId:string) {
  const exp=Math.floor(Date.now()/1000)+SESSION_TTL, payload=`${userId}.${exp}`, token=`${payload}.${await hmac(payload)}`;
  (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:SESSION_TTL});
}
export async function clearSession(){(await cookies()).delete(COOKIE);}
export async function getSessionUser():Promise<User|null>{
  const token=(await cookies()).get(COOKIE)?.value; if(!token) return null;
  const [userId,expText,signature]=token.split("."); if(!userId||!expText||!signature||Number(expText)<Math.floor(Date.now()/1000)) return null;
  const expected=await hmac(`${userId}.${expText}`); if(signature!==expected) return null;
  const env=getCloudflareContext().env as {DB:D1Database};
  return await env.DB.prepare("SELECT id,email,full_name,country,phone,address,role FROM users WHERE id=? LIMIT 1").bind(userId).first<User>() || null;
}
export async function signInUser(email:string,password:string){
  const env=getCloudflareContext().env as {DB:D1Database};
  const row=await env.DB.prepare("SELECT id,email,full_name,country,phone,address,role,password_hash FROM users WHERE lower(email)=lower(?) LIMIT 1").bind(email.trim()).first<User & {password_hash:string}>();
  if(!row||!(await verifyPassword(password,row.password_hash))) return {error:{code:"invalid_credentials",message:"Invalid credentials"}};
  await createSession(row.id); const {password_hash:_ignored,...user}=row; return {data:{user},error:null};
}
export async function signUpUser(input:{email:string;password:string;fullName:string;country:string;mobile?:string;address?:string}){
  const env=getCloudflareContext().env as {DB:D1Database}; const email=input.email.trim().toLowerCase();
  const exists=await env.DB.prepare("SELECT id FROM users WHERE lower(email)=lower(?) LIMIT 1").bind(email).first<{id:string}>();
  if(exists) return {error:{code:"account_already_registered",message:"An account with this email already exists."}};
  const id=crypto.randomUUID(), passwordHash=await hashPassword(input.password);
  await env.DB.prepare("INSERT INTO users (id,email,password_hash,full_name,country,phone,address,role,email_confirmed) VALUES (?,?,?,?,?,?,?,?,1)").bind(id,email,passwordHash,input.fullName.trim(),input.country,input.mobile?.trim()||"",input.address?.trim()||"","user").run();
  return {data:{user:{id,email,full_name:input.fullName.trim(),country:input.country,phone:input.mobile?.trim()||"",address:input.address?.trim()||"",role:"user"}},error:null};
}
export async function updateCurrentUser(values:{password?:string;phone?:string;email?:string;full_name?:string;country?:string;address?:string}){
  const user=await getSessionUser(); if(!user) return {data:{user:null},error:new Error("Not authenticated")};
  const env=getCloudflareContext().env as {DB:D1Database}; const sets:string[]=[]; const vals:unknown[]=[];
  for(const key of ["password","phone","email","full_name","country","address"] as const) if(values[key]!==undefined){sets.push(`${key==="password"?"password_hash":key}=?`); vals.push(key==="password"?await hashPassword(values[key]!):values[key]);}
  if(sets.length){sets.push("updated_at=CURRENT_TIMESTAMP");await env.DB.prepare(`UPDATE users SET ${sets.join(",")} WHERE id=?`).bind(...vals,user.id).run();}
  return {data:{user:await getSessionUser()},error:null};
}
