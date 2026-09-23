import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import { getSupabaseConfig } from "./config"

export function createClient() {
  const cookieStore = cookies()
  const { url, anonKey } = getSupabaseConfig()
  return createServerClient(url, anonKey, {
    cookies: {
      async getAll() { return (await cookieStore).getAll() },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(async ({ name, value, options }) => (await cookieStore).set(name, value, options)) } catch {}
      },
    },
  })
}

export const getUser = cache(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
