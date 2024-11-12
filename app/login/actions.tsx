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
  // console.log("data 111=>", data)

  const { data: authData, error } = await supabase.auth.signUp(data)
  // console.log("authdata=>", authData)
  // console.log("authdata error=>", error)

  if (error) {
    redirect("/login?authError=internalError")
  } else {
    if (authData.user) {
      revalidatePath("/", "layout")
      redirect("/login?accountCreated=success")
    }
  }
}
