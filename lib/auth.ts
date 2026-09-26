import {getCloudflareContext} from "@opennextjs/cloudflare";
import crypto from "node:crypto";
import {cookies} from "next/headers";

export async function getEnv(){const {env}=await getCloudflareContext({async:true});return env;}
export async function hashPassword(password:string){return crypto.createHash("sha256").update(password).digest("hex");}
export async function createSession(userId:string){
  const env=await getEnv(); const token=crypto.randomBytes(32).toString("hex");
  const hash=crypto.createHash("sha256").update(token).digest("hex");
  const id=crypto.randomUUID(); const expires=new Date(Date.now()+15*24*60*60*1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES(?,?,?,?)").bind(id,userId,hash,expires).run();
  const jar=await cookies(); jar.set("so_session",token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:15*24*60*60});
}
export async function getCurrentUser(){
  const env=await getEnv(); const jar=await cookies(); const token=jar.get("so_session")?.value; if(!token)return null;
  const hash=crypto.createHash("sha256").update(token).digest("hex");
  const row=await env.DB.prepare("SELECT u.id,u.name,u.email,u.country,u.mobile,u.address,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP").bind(hash).first<any>();
  return row||null;
}
export async function requireUser(){const u=await getCurrentUser();if(!u)throw new Error("UNAUTHORIZED");return u;}
export async function logout(){const env=await getEnv();const jar=await cookies();const token=jar.get("so_session")?.value;if(token){const hash=crypto.createHash("sha256").update(token).digest("hex");await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(hash).run();}jar.set("so_session","",{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:0});}
