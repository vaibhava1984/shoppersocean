import { currentUser } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";

export async function getClerkUser() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() ?? "";
  return { user, email };
}

/**
 * Resolves the existing application profile without using Supabase.
 * The legacy profile UUID remains stable so historical orders, payments,
 * books, authors, testimonials and private-file records remain linked.
 */
export async function getLegacyProfileForClerkUser() {
  const session = await getClerkUser();
  if (!session?.email) return null;

  const db = getD1();
  if (!db) return null;

  const profile = await db
    .prepare("SELECT id, email, full_name, country, mobile, address FROM profiles WHERE lower(email) = ? LIMIT 1")
    .bind(session.email)
    .first();

  if (!profile) return null;
  return { clerkUser: session.user, profile };
}
