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
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function signUp(formData: {
  fullName: string,
  email: string,
  password: string
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
      },
    },
  }
  // console.log("data 111=>", data)

  const { data: authData, error } = await supabase.auth.signUp(data)
  // console.log("authdata=>", authData)
  // console.log("authdata error=>", error)

  if (error) {
    redirect("/error")
  } else {
    if (authData.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'publisher' // Default to 'user' if no role specified
        })

      if (roleError) throw roleError

      revalidatePath("/", "layout")
      redirect("/")
    }
  }
}
