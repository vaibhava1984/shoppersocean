import type { CloudflareEnv } from "../auth/types";

export type D1User = {
  id: string; clerk_user_id: string | null; email: string; full_name: string;
  country: string; mobile: string; address: string;
  role: "admin" | "publisher" | "user"; created_at: string | null; updated_at: string | null;
};

export async function getUserById(env: CloudflareEnv, id: string): Promise<D1User | null> {
  return env.DB.prepare("SELECT id, clerk_user_id, email, full_name, country, mobile, address, role, created_at, updated_at FROM users WHERE id = ?1 LIMIT 1").bind(id).first<D1User>();
}

export async function getUserByClerkId(env: CloudflareEnv, clerkUserId: string): Promise<D1User | null> {
  return env.DB.prepare("SELECT id, clerk_user_id, email, full_name, country, mobile, address, role, created_at, updated_at FROM users WHERE clerk_user_id = ?1 LIMIT 1").bind(clerkUserId).first<D1User>();
}

export async function upsertUserFromClerk(env: CloudflareEnv, user: { clerkUserId: string; email: string; fullName?: string }): Promise<D1User> {
  const existing = await getUserByClerkId(env, user.clerkUserId);
  const now = new Date().toISOString();
  if (existing) {
    await env.DB.prepare("UPDATE users SET email = ?1, full_name = ?2, updated_at = ?3 WHERE clerk_user_id = ?4").bind(user.email, user.fullName || existing.full_name, now, user.clerkUserId).run();
  } else {
    await env.DB.prepare("INSERT INTO users (id, clerk_user_id, email, full_name, country, mobile, address, role, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, '', '', '', 'user', ?5, ?5)").bind(crypto.randomUUID(), user.clerkUserId, user.email, user.fullName || "", now).run();
  }
  const result = await getUserByClerkId(env, user.clerkUserId);
  if (!result) throw new Error("Unable to create or load D1 user");
  return result;
}
