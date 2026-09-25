import { cookies } from "next/headers"
import { firebaseAdminAuth, firebaseAdminDb } from "@/utils/firebase/server_admin"
import { createServerDataClient } from "@/utils/firebase/compat_server"

export function createAdminClient() {
  const dataClient = createServerDataClient()
  return {
    ...dataClient,
    auth: {
      async getUser() {
        try {
          const store = await cookies()
          const token = store.get("session")?.value
          if (!token) return { data: { user: null }, error: null }
          const decoded:any = await firebaseAdminAuth.verifySessionCookie(token, true)
          return { data: { user: { id: decoded.uid, uid: decoded.uid, email: decoded.email ?? null, user_metadata: {}, app_metadata: {} } }, error: null }
        } catch { return { data: { user: null }, error: null } }
      },
      admin: {
        async listUsers({ page = 1, perPage = 1000 }: any = {}) {
          try {
            const result = await firebaseAdminAuth.listUsers(Math.min(perPage, 1000))
            return { data: { users: result.users.map((u:any) => ({
              id: u.uid, email: u.email, phone: u.phone, created_at: u.metadata.creationTime,
              updated_at: u.metadata.lastRefreshTime, app_metadata: u.customClaims || {},
              user_metadata: { full_name: u.displayName || "" }, confirmed_at: u.emailVerified ? u.metadata.creationTime : null,
              last_sign_in_at: u.metadata.lastSignInTime
            })) }, error: null }
          } catch (error:any) { return { data: { users: [] }, error: { message: error?.message || "Unable to list users" } } }
        },
        async getUserById(uid: string) { try { const u:any = await firebaseAdminAuth.getUser(uid); return { data: { user: { id: u.uid, uid: u.uid, email: u.email ?? null, email_verified: u.emailVerified, app_metadata: u.customClaims || {}, user_metadata: { full_name: u.displayName || "" } } }, error: null } } catch (error:any) { return { data: { user: null }, error: { message: error?.message || "Unable to get user" } } } },
        async deleteUser(uid: string) {
          try { await firebaseAdminAuth.deleteUser(uid); return { data: { user: null }, error: null } }
          catch (error:any) { return { data: { user: null }, error: { message: error?.message || "Unable to delete user" } } }
        },
        async updateUserById(uid: string, properties: any) {
          try {
            const update:any = {}
            if (properties.email) update.email = properties.email
            if (properties.phone) update.phoneNumber = properties.phone
            if (properties.user_metadata?.full_name) update.displayName = properties.user_metadata.full_name
            const user = await firebaseAdminAuth.updateUser(uid, update)
            await firebaseAdminDb.collection("profiles").doc(uid).set({ id: uid, email: user.email || "", full_name: user.displayName || "", ...(properties.user_metadata || {}) }, { merge: true })
            return { data: { user }, error: null }
          } catch (error:any) { return { data: { user: null }, error: { message: error?.message || "Unable to update user" } } }
        }
      }
    }
  }
}
