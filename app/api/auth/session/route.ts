import { NextResponse } from "next/server"
import { firebaseAdminAuth } from "@/utils/firebase/server_admin"

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
    }
    const decoded = await firebaseAdminAuth.verifyIdToken(idToken)
    const authTime = Number(decoded.auth_time || 0)
    if (!authTime || Date.now() / 1000 - authTime > 5 * 60) {
      return NextResponse.json({ error: "Recent sign-in required" }, { status: 401 })
    }
    const expiresIn = 1000 * 60 * 60 * 24 * 7
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn })
    const response = NextResponse.json({ ok: true })
    response.cookies.set("session", sessionCookie, {
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ error: "Unable to create session" }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set("session", "", { maxAge: 0, path: "/" })
  return response
}