import type { CloudflareEnv } from "./types";
import { getAuthContext } from "./clerk";
import { getUserByClerkId, upsertUserFromClerk } from "../db/users";

/**
 * Resolves the authenticated Clerk identity into the application's D1 user.
 * This is the single boundary application routes should use instead of
 * reading authentication state directly.
 */
export async function getCurrentUser(
  request: Request,
  env: CloudflareEnv,
  verifyToken: Parameters<typeof getAuthContext>[2],
) {
  const auth = await getAuthContext(request, env, verifyToken);
  if (!auth.user) return null;

  const existing = await getUserByClerkId(env, auth.user.clerkUserId);
  if (existing) return existing;

  return upsertUserFromClerk(env, {
    clerkUserId: auth.user.clerkUserId,
    email: auth.user.email,
    fullName: auth.user.fullName,
  });
}
