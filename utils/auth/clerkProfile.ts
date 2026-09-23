import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/utils/supabase/server_admin"

export async function getClerkUser() {
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() ?? ""
  return { user, email }
}

/**
 * Keeps existing Supabase-owned records addressable after moving authentication
 * to Clerk. The legacy profile UUID is intentionally preserved; no existing
 * orders, payments, books, authors, reviews, or files are rewritten here.
 */
export async function getLegacyProfileForClerkUser() {
  const session = await getClerkUser()
  if (!session?.email) return null

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,email,full_name")
    .ilike("email", session.email)
    .maybeSingle()

  if (error) throw error
  if (!profile) return null

  return { clerkUser: session.user, profile }
}
