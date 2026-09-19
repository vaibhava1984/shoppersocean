"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

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
  const supabase = createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
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

  // Email/password signup can return a session when email confirmation is disabled.
  // If a mobile number was supplied, attach it to Auth so Supabase sends its SMS OTP.
  if (formData.mobile?.trim()) {
    if (!authData.session) {
      return {
        error: "phone_verification_after_email",
        userId: authData.user.id,
        phone: formData.mobile.trim(),
      }
    }

    const { error: phoneError } = await supabase.auth.updateUser({
      phone: formData.mobile.trim(),
    })

    if (phoneError) {
      return { error: phoneError.message }
    }

    return {
      success: true,
      phoneVerificationRequired: true,
      phone: formData.mobile.trim(),
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
