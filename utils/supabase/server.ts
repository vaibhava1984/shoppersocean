import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import { getSupabaseConfig } from "./config"

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseConfig()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Cookie writes can be unavailable in some Server Component contexts.
          // Middleware remains responsible for refreshing the session.
        }
      },
    },
  })
}

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
