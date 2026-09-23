/**
 * Clerk/D1 authentication boundary.
 *
 * This module deliberately has no Clerk SDK dependency yet. The production
 * binding is added when the Cloudflare Worker is provisioned. Keeping the
 * boundary here lets application code stop depending on Supabase sessions
 * without changing the UI.
 */

export type AuthenticatedUser = {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  country: string;
  mobile: string;
  address: string;
  role: "admin" | "publisher" | "user";
};

export type AuthContext = {
  user: AuthenticatedUser | null;
};

export type ClerkTokenVerifier = (token: string) => Promise<{
  sub: string;
  email?: string;
  name?: string;
}>;

/**
 * Worker/API adapter. The verifier is injected so the same application layer
 * can be tested without a live Clerk account and without exposing secrets.
 */
export async function getAuthContext(
  request: Request,
  env: { CLERK_SECRET_KEY?: string },
  verify: ClerkTokenVerifier,
): Promise<AuthContext> {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return { user: null };

  const token = header.slice(7).trim();
  if (!token || !env.CLERK_SECRET_KEY) return { user: null };

  const claims = await verify(token);
  return {
    user: {
      id: claims.sub,
      clerkUserId: claims.sub,
      email: claims.email || "",
      fullName: claims.name || "",
      country: "",
      mobile: "",
      address: "",
      role: "user",
    },
  };
}
