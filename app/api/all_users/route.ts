import { NextResponse } from 'next/server'
import { firebaseAdminAuth, firestore } from '@/lib/firebase/admin'
import { getFirebaseUser } from '@/lib/firebase/session'

export async function POST() {
  try {
    const user = await getFirebaseUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    let role = (user as any).userrole || (user as any).role
    if (role !== 'ADMIN') {
      const profile = await firestore.collection('profiles').doc(user.uid).get()
      role = profile.exists ? profile.data()?.userrole : role
    }
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    const result = await firebaseAdminAuth.listUsers(1000)
    const users = result.users.map((u:any) => ({
      id: u.uid, email: u.email ?? '', phone: u.phoneNumber ?? null,
      created_at: u.metadata?.creationTime ?? null, updated_at: u.metadata?.lastRefreshTime ?? null,
      app_metadata: { userrole: u.customClaims?.userrole ?? 'USER', isAuthor: Boolean(u.customClaims?.isAuthor) },
      user_metadata: { full_name: u.displayName ?? '', email: u.email ?? '' },
      confirmed_at: u.emailVerified ? u.metadata?.creationTime ?? null : null,
      last_sign_in_at: u.metadata?.lastSignInTime ?? null,
    }))
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
