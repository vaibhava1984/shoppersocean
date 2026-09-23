import { type NextFetchEvent, type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

/**
 * Migration-safe authentication boundary.
 *
 * Supabase remains the active authentication system until the Clerk cutover
 * has been explicitly enabled. Setting CLERK_MIGRATION_ENABLED=true switches
 * this boundary to Clerk's middleware without changing the default behavior.
 *
 * This prevents an incomplete Clerk configuration from breaking the migration
 * build or the existing authentication path.
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (process.env.CLERK_MIGRATION_ENABLED === "true") {
    const { clerkMiddleware } = await import("@clerk/nextjs/server")
    const clerkHandler = clerkMiddleware()
    return clerkHandler(request, event)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - common image assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
