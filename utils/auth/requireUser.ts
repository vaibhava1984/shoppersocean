import { getCurrentUser } from "@/utils/auth/session";
export async function requireUser(){return getCurrentUser()}
export async function requireAdmin(){const user=await getCurrentUser();return user&&String(user.role||"USER").toUpperCase()==="ADMIN"?user:null}
