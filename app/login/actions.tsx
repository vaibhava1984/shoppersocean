"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function signIn(formData: {
  email: string,
  password: string
}) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
    redirect: '/'
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  // console.log("signin error=>", error)
  // console.log("signin error code=>", error?.code)

  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect("/login?authError=email_not_confirmed")
    } else if (error.code === "invalid_credentials") {
      redirect("/login?authError=invalid_credentials")
    }
    else {
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
}) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
    options: {
      data: {
        full_name: formData.fullName as string,
        country: formData.country as string,
      },
    },
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect("/login?authError=internalError")
  }

  // Supabase intentionally returns an obfuscated user for an already-registered
  // confirmed email when email confirmation is enabled. In that case the user
  // object can be present even though no new account was created.
  if (authData.user && authData.user.identities?.length === 0) {
    redirect("/login?authError=account_already_registered")
  }

  if (authData.user) {
    revalidatePath("/", "layout")
    redirect("/login?accountCreated=success")
  }

  redirect("/login?authError=internalError")
}
