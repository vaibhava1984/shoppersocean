import { NextResponse } from "next/server"
import { firestore } from "@/lib/firebase/admin"
import { getFirebaseUser } from "@/lib/firebase/session"

async function isAdmin() {
  const user: any = await getFirebaseUser()
  if (!user) return false
  let role = user.userrole || user.role
  if (role !== "ADMIN") {
    const profile = await firestore.collection("profiles").doc(user.uid).get()
    role = profile.exists ? profile.data()?.userrole : role
  }
  return role === "ADMIN"
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 })
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Review ID is required." }, { status: 400 })
    const ref = firestore.collection("testimonials").doc(String(id))
    const snap = await ref.get()
    if (!snap.exists) return NextResponse.json({ error: "Review not found." }, { status: 404 })
    await ref.delete()
    return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
