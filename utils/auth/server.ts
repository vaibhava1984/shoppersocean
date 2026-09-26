import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const COOKIE = "so_session";
const SESSION_TTL = 60 * 60 * 24 * 30;
const PBKDF2_ITERATIONS = 100000;
type User = { id: string; email: string; full_name?: string|null; country?: string|null; phone?: string|null; address?: string|null; role?: string|null };

function secret() { const env = getCloudflareContext().env as { AUTH_SECRET?: string }; return env.AUTH_SECRET || process.env.AUTH_SECRET || "shoppers-ocean-local-secret-change-me"; }
function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }

async function hmac(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  return bytesToBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
async function hashPassword(password: string, salt = crypto.randomUUID()) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:PBKDF2_ITERATIONS,hash:"SHA-256"}, key, 256);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${bytesToBase64(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string) {
  const parts=stored.split("$"); if(parts.length!==4||parts[0]!=="pbkdf2") return false;
  const iterations=Number(parts[1]); if(!Number.isFinite(iterations)||iterations<1||iterations>PBKDF2_ITERATIONS) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(parts[2]),iterations,hash:"SHA-256"}, key, 256);
  return `pbkdf2$${iterations}$${parts[2]}$${bytesToBase64(new Uint8Array(bits))}`===stored;
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

export async function requestPasswordReset(email:string){
  const env=getCloudflareContext().env as {DB:D1Database};
  const normalized=email.trim().toLowerCase();
  const row=await env.DB.prepare("SELECT id,email,full_name FROM users WHERE lower(email)=lower(?) LIMIT 1").bind(normalized).first<{id:string;email:string;full_name:string|null}>();
  if(!row) return {ok:true};
  const rawToken=crypto.randomUUID()+"-"+crypto.randomUUID();
  const tokenHash=await hmac(rawToken);
  const expiresAt=new Date(Date.now()+60*60*1000).toISOString();
  await env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id=?").bind(row.id).run();
  await env.DB.prepare("INSERT INTO password_reset_tokens (token_hash,user_id,expires_at) VALUES (?,?,?)").bind(tokenHash,expiresAt).run();
  const origin=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.shoppersocean.com").replace(/\/$/,"");
  const resetUrl=origin+"/update-password?token="+encodeURIComponent(rawToken);
  const apiKey=process.env.RESEND_API_KEY;
  if(!apiKey) throw new Error("Password reset email service is not configured");
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({from:"no-reply@shoppersocean.com",to:[row.email],subject:"Reset your Shoppers Ocean password",html:"<p>Hello "+(row.full_name||"")+",</p><p>Click the button below to reset your Shoppers Ocean password.</p><p><a href=\""+resetUrl+"\" style=\"display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px\">Reset Password</a></p><p>This link expires in 1 hour.</p>"})});
  if(!response.ok) throw new Error("Unable to send password reset email");
  return {ok:true};
}

export async function resetPasswordWithToken(token:string,password:string){
  if(!token) return {error:new Error("Invalid or expired reset link")};
  if(password.length<6) return {error:new Error("Password must be at least 6 characters long")};
  const env=getCloudflareContext().env as {DB:D1Database};
  const tokenHash=await hmac(token);
  const row=await env.DB.prepare("SELECT user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1").bind(tokenHash,new Date().toISOString()).first<{user_id:string}>();
  if(!row) return {error:new Error("Invalid or expired reset link")};
  const passwordHash=await hashPassword(password);
  await env.DB.prepare("UPDATE users SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(passwordHash,row.user_id).run();
  await env.DB.prepare("UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE token_hash=?").bind(tokenHash).run();
  await clearSession();
  return {data:{success:true},error:null};
}