"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/db/server"

export async function signIn(formData: {
  email: string,
  password: string
}) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
    options: { redirectTo: "/" },
  })

  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect("/login?authError=email_not_confirmed")
    } else if (error.code === "invalid_credentials") {
      redirect("/login?authError=invalid_credentials")
    } else {
      redirect("/login?authError=internalError")
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
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
    const supabase = createClient()
    const email = formData.email.trim()
    const fullName = formData.fullName.trim()
    const mobile = formData.mobile?.trim() || ""

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: formData.password,
      options: {
        data: {
          full_name: fullName,
          country: formData.country,
          address: formData.address?.trim() || "",
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (authData.user && authData.user.identities?.length === 0) {
      return { error: "account_already_registered" }
    }

    if (!authData.user) {
      return { error: "internal_error" }
    }

    // If a mobile number was supplied, attach it to Auth so Supabase can send
    // the SMS OTP. When email confirmation is enabled there is no session yet,
    // so the user must confirm the email before adding the phone in Settings.
    if (mobile) {
      if (!authData.session) {
        return {
          error: "phone_verification_after_email",
          userId: authData.user.id,
          phone: mobile,
        }
      }

      const { error: phoneError } = await supabase.auth.updateUser({
        phone: mobile,
      })

      if (phoneError) {
        return { error: phoneError.message }
      }

      return {
        success: true,
        phoneVerificationRequired: true,
        phone: mobile,
      }
    }

    // Do not revalidate the entire layout during account creation. Signup should
    // complete even if cache revalidation is unavailable in the current runtime.
    return { success: true }
  } catch (error: any) {
    return {
      error: error?.message || "Unable to create the account. Please try again.",
    }
  }
}
