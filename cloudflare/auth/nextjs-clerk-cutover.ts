/**
 * Next.js/Clerk cutover adapter.
 *
 * This file intentionally contains only the integration contract. The actual
 * @clerk/nextjs dependency and Clerk middleware are added at the cutover stage,
 * after the Clerk application is provisioned. This prevents an incomplete auth
 * provider from breaking the migration branch.
 *
 * Required production pieces:
 *   - ClerkProvider at the application root
 *   - clerkMiddleware() for Next.js 15
 *   - server auth() checks for protected resources
 *   - Clerk SignIn/SignUp or the custom existing login UI backed by Clerk hooks
 *
 * The existing Shoppers Ocean login form can retain its fields and visual
 * design; only its authentication calls need to be switched to Clerk.
 */

export const CLERK_CUTOVER_REQUIREMENTS = {
  nextMiddlewareFile: "middleware.ts",
  provider: "ClerkProvider",
  serverAuth: "auth()",
  clientAuth: "useAuth/useSignIn/useSignUp",
  requiredSecrets: [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ],
} as const;

export function isClerkConfigured(env: {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
}) {
  return Boolean(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    env.CLERK_SECRET_KEY
  );
}
