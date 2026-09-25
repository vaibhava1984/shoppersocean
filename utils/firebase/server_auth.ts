import { cookies } from "next/headers"
import { firebaseAdminAuth } from "./server_admin"

export async function getFirebaseUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null

  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(session, true)
    return {
      uid: decoded.uid,
      id: decoded.uid,
      email: decoded.email || null,
      email_verified: decoded.email_verified === true,
      app_metadata: {
        userrole: decoded.admin === true ? "ADMIN" : undefined,
        isAuthor: decoded.isAuthor === true,
      },
      user_metadata: {
        full_name: decoded.name || "",
        phone: decoded.phone_number || "",
      },
    }
  } catch {
    return null
  }
}