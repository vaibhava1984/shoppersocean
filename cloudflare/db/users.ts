import type { CloudflareEnv } from "../auth/types";

export type D1User = {
  id: string; clerk_user_id: string | null; email: string; full_name: string;
  country: string; mobile: string; address: string;
  role: "admin" | "publisher" | "user"; created_at: string | null; updated_at: string | null;
};

const USER_COLUMNS = "id, clerk_user_id, email, full_name, country, mobile, address, role, created_at, updated_at";

export async function getUserById(env: CloudflareEnv, id: string): Promise<D1User | null> {
  return env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?1 LIMIT 1`).bind(id).first<D1User>();
}

export async function getUserByClerkId(env: CloudflareEnv, clerkUserId: string): Promise<D1User | null> {
  return env.DB.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE clerk_user_id = ?1 LIMIT 1`).bind(clerkUserId).first<D1User>();
}

export async function upsertUserFromClerk(env: CloudflareEnv, user: { clerkUserId: string; email: string; fullName?: string; country?: string; mobile?: string; address?: string; role?: "admin" | "publisher" | "user" }): Promise<D1User> {
  const existing = await getUserByClerkId(env, user.clerkUserId);
  const now = new Date().toISOString();
  if (existing) {
    await env.DB.prepare("UPDATE users SET email = ?1, full_name = ?2, country = ?3, mobile = ?4, address = ?5, role = ?6, updated_at = ?7 WHERE clerk_user_id = ?8")
      .bind(user.email, user.fullName || existing.full_name, user.country ?? existing.country, user.mobile ?? existing.mobile, user.address ?? existing.address, user.role ?? existing.role, now, user.clerkUserId).run();
  } else {
    await env.DB.prepare("INSERT INTO users (id, clerk_user_id, email, full_name, country, mobile, address, role, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, '', '', '', 'user', ?5, ?5)")
      .bind(crypto.randomUUID(), user.clerkUserId, user.email, user.fullName || "", user.country ?? "", user.mobile ?? "", user.address ?? "", user.role ?? "user", now).run();
  }
  const result = await getUserByClerkId(env, user.clerkUserId);
  if (!result) throw new Error("Unable to create or load D1 user");
  return result;
}

export async function updateUserProfile(
  env: CloudflareEnv,
  id: string,
  patch: Partial<{ fullName: string; country: string; mobile: string; address: string }>,
): Promise<D1User> {
  const sets: string[] = [];
  const values: string[] = [];
  const map: Record<string, string> = { fullName: "full_name", country: "country", mobile: "mobile", address: "address" };
  for (const [key, column] of Object.entries(map)) {
    if (patch[key as keyof typeof patch] !== undefined) {
      sets.push(`${column} = ?`);
      values.push(patch[key as keyof typeof patch] as string);
    }
  }
  if (!sets.length) {
    const current = await getUserById(env, id);
    if (!current) throw new Error("User not found");
    return current;
  }
  values.push(new Date().toISOString(), id);
  await env.DB.prepare(`UPDATE users SET ${sets.join(", ")}, updated_at = ? WHERE id = ?`).bind(...values).run();
  const updated = await getUserById(env, id);
  if (!updated) throw new Error("User not found");
  return updated;
}

export async function deleteUserData(env: CloudflareEnv, userId: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM testimonials WHERE user_id = ?1").bind(userId),
    env.DB.prepare("DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?1)").bind(userId),
    env.DB.prepare("DELETE FROM orders WHERE user_id = ?1").bind(userId),
    env.DB.prepare("DELETE FROM authors_interest_submission WHERE user_id = ?1").bind(userId),
    env.DB.prepare("DELETE FROM authors WHERE user_id = ?1").bind(userId),
    env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(userId),
  ]);
}
