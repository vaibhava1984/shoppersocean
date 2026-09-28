import { cookies } from "next/headers";
import { getD1 } from "@/utils/cloudflare/d1";
const COOKIE="so_session";
export async function hashPassword(password:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("so:"+password));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function getCurrentUser(){const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const db=getD1();if(!db)return null;return db.prepare("SELECT p.* FROM auth_sessions s JOIN profiles p ON p.id=s.user_id WHERE s.token=? AND s.expires_at>? LIMIT 1").bind(token,new Date().toISOString()).first<Record<string,unknown>>()}
export async function createSession(userId:string){const db=getD1();if(!db)throw new Error("Database unavailable");const token=crypto.randomUUID();const expires=new Date(Date.now()+30*86400000).toISOString();await db.prepare("INSERT INTO auth_sessions(token,user_id,expires_at) VALUES(?,?,?)").bind(token,userId,expires).run();(await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:true,path:"/",expires:new Date(expires)});}
export async function clearSession(){const jar=await cookies();const token=jar.get(COOKIE)?.value;const db=getD1();if(db&&token)await db.prepare("DELETE FROM auth_sessions WHERE token=?").bind(token).run();jar.delete(COOKIE)}
