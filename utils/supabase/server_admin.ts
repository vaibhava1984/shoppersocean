import { createClient } from "@supabase/supabase-js"

// Server-only Supabase client for trusted admin database operations.
// Do not attach browser/session cookies here: the service-role key must
// remain the authenticated database role so RLS does not block admin writes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
