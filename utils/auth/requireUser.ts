import { currentUser } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";

export async function requireClerkUser() {
  const user = await currentUser();
  if (!user) return null;
  const email = user.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() ?? "";
  const db = getD1();
  if (!db || !email) return null;
  const profile = await db.prepare("SELECT * FROM profiles WHERE lower(email) = ? LIMIT 1").bind(email).first<Record<string, unknown>>();
  if (!profile) return null;
  return { user, profile };
}

export async function requireAdmin() {
  const identity = await requireClerkUser();
  if (!identity) return null;
  const role = identity.user.publicMetadata?.userrole;
  return role === "ADMIN" ? identity : null;
}
