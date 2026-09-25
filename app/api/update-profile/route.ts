import { NextResponse } from "next/server"
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin"
import { getFirebaseUser } from "@/lib/firebase/session"

export async function POST(request: Request) {
  try {
    const user: any = await getFirebaseUser()
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    const body = await request.json()
    const fullName = String(body.fullName ?? "").trim()
    const country = String(body.country ?? "").trim()
    const email = String(body.email ?? "").trim()
    const address = String(body.address ?? "").trim()
    const mobile = String(body.mobile ?? "").trim()
    if (!fullName || !country || !email) return NextResponse.json({ error: "Name, Country and Email are required." }, { status: 400 })

    const update: any = { displayName: fullName, email }
    if (mobile) update.phoneNumber = mobile
    else if (user.phone_number) update.phoneNumber = null
    await firebaseAdminAuth.updateUser(user.uid, update)
    await firestore.collection("profiles").doc(user.uid).set({
      id: user.uid, email, full_name: fullName, country, address, mobile,
      updated_at: new Date().toISOString(),
    }, { merge: true })
    return NextResponse.json({ success: true, user: { id: user.uid, email, displayName: fullName }, mobile })
  } catch (error: any) {
    console.error("Profile update request failed:", error)
    const code = String(error?.code || "")
    if (code.includes("email-already-exists")) return NextResponse.json({ error: "That email address is already registered." }, { status: 409 })
    if (code.includes("invalid-phone-number")) return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 })
    return NextResponse.json({ error: error?.message || "Unable to update your details right now." }, { status: 500 })
  }
}
