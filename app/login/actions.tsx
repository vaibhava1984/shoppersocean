"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createFirebaseSessionCookie, FIREBASE_SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/firebase/session"
import { createProfile, signInWithPassword, signUpWithPassword } from "@/lib/firebase/auth-server"
import { cookies } from "next/headers"

async function setSession(idToken: string) {
  const cookieStore = await cookies()
  const session = await createFirebaseSessionCookie(idToken)
  cookieStore.set(FIREBASE_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MAX_AGE / 1000),
  })
}

export async function signIn(formData: { email: string, password: string }) {
  try {
    const auth = await signInWithPassword(formData.email.trim(), formData.password)
    await setSession(auth.idToken)
    revalidatePath("/", "layout")
    redirect("/")
  } catch (error: any) {
    const code = String(error?.code || "")
    if (code.includes("EMAIL_NOT_FOUND") || code.includes("INVALID_PASSWORD") || code.includes("INVALID_LOGIN_CREDENTIALS")) {
      redirect("/login?authError=invalid_credentials")
    }
    redirect("/login?authError=internalError")
  }
}

export async function signUp(formData: {
  fullName: string,
  email: string,
  password: string,
  country: string,
  mobile?: string,
  address?: string,
}) {
  try {
    const email = formData.email.trim()
    const fullName = formData.fullName.trim()
    const country = formData.country.trim()
    const mobile = formData.mobile?.trim() || ""
    if (!fullName || !country || !email || !formData.password || formData.password.length < 6) {
      return { error: "Please complete all required fields. Password must be at least 6 characters." }
    }

    const auth = await signUpWithPassword(email, formData.password)
    await createProfile(auth.localId, {
      full_name: fullName,
      email,
      country,
      mobile,
      address: formData.address?.trim() || "",
      userrole: "USER",
      isAuthor: false,
    })
    await setSession(auth.idToken)

    return { success: true }
  } catch (error: any) {
    const code = String(error?.code || "")
    if (code.includes("EMAIL_EXISTS")) return { error: "account_already_registered" }
    if (code.includes("WEAK_PASSWORD")) return { error: "Password must be at least 6 characters." }
    return { error: error?.message || "Unable to create the account. Please try again." }
  }
}
