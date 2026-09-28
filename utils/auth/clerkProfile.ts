import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
export async function getCurrentProfile(){const user=await getCurrentUser();if(!user)return null;return {user,profile:user}}
export async function getLegacyProfileForUser(){const user=await getCurrentUser();if(!user)return null;const db=getD1();if(!db)return null;const profile=await db.prepare("SELECT id,email,full_name,country,mobile,address FROM profiles WHERE id=? LIMIT 1").bind(user.id).first();return profile?{user,profile}:null}
