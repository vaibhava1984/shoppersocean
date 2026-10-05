import { getCurrentUser, type AppUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

export type AuthIdentity = {
  user: AppUser;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    country: string | null;
    mobile: string | null;
    address: string | null;
  };
};

export async function requireUser(): Promise<AuthIdentity | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const db = getD1();
    if (!db) return null;
    const profile = await db.prepare(
      "SELECT id, email, full_name, country, phone AS mobile, address FROM users WHERE id = ? LIMIT 1"
    ).bind(user.id).first<AuthIdentity["profile"]>();
    if (!profile) return null;
    return { user, profile };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthIdentity | null> {
  const identity = await requireUser();
  if (!identity) return null;
  return identity.user.publicMetadata.userrole === "ADMIN" ? identity : null;
}
