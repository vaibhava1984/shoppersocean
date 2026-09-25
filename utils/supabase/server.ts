import { cookies } from "next/headers"
import { cache } from "react"
import { firebaseAdminAuth } from "@/utils/firebase/server_admin"
import { createServerDataClient } from "@/utils/firebase/compat_server"

export function createClient() {
  return createServerDataClient()
}

export const getUser = cache(async () => {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value
    if (!session) return null
    const decoded = await firebaseAdminAuth.verifySessionCookie(session, true)
    return {
      id: decoded.uid,
      uid: decoded.uid,
      email: decoded.email ?? null,
      email_verified: decoded.email_verified ?? false,
      user_metadata: decoded.firebase?.identities ?? {},
      app_metadata: {},
    } as any
  } catch {
    return null
  }
})
