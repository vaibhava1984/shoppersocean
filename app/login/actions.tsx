"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { signInUser, signUpUser } from "@/utils/auth/server"

export async function signIn(formData: { email: string; password: string }) {
  const result = await signInUser(formData.email, formData.password)
  if (result.error) {
    if (result.error.code === "password_reset_required") redirect("/login?authError=password_reset_required")
    if (result.error.code === "invalid_credentials") redirect("/login?authError=invalid_credentials")
    redirect("/login?authError=internalError")
  }
  revalidatePath("/", "layout")
  redirect("/")
}

export async function signUp(formData: {
  fullName: string
  email: string
  password: string
  country: string
  mobile?: string
  address?: string
}) {
  try {
    const result = await signUpUser({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      country: formData.country,
      mobile: formData.mobile,
      address: formData.address,
    })
    if (result.error) return { error: result.error.code || result.error.message }
    return { success: true }
  } catch (error: any) {
    return { error: error?.message || "Unable to create the account. Please try again." }
  }
}
