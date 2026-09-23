import type { CloudflareEnv, ShoppersOceanUser } from "../auth/types"

export async function getUserByClerkId(
  env: CloudflareEnv,
  clerkUserId: string,
): Promise<ShoppersOceanUser | null> {
  const row = await env.DB.prepare(
    `SELECT id, clerk_user_id, email, full_name, country, mobile, address, role
     FROM users WHERE clerk_user_id = ? LIMIT 1`,
  ).bind(clerkUserId).first<{
    id: string
    clerk_user_id: string
    email: string
    full_name: string
    country: string
    mobile: string
    address: string
    role: "admin" | "publisher" | "user"
  }>()

  if (!row) return null

  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    email: row.email,
    fullName: row.full_name,
    country: row.country,
    mobile: row.mobile,
    address: row.address,
    role: row.role,
  }
}
