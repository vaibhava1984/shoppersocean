import { Resend } from "resend"
import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile"
import { createAdminClient } from "@/utils/supabase/server_admin"

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

export async function POST() {
  try {
    const identity = await getLegacyProfileForClerkUser()
    if (!identity) return NextResponse.json({ error: "You must be signed in to delete your account." }, { status: 401 })
    const { clerkUser, profile } = identity
    const email = clerkUser.emailAddresses?.[0]?.emailAddress
    if (!email) return NextResponse.json({ error: "Your account does not have an email address." }, { status: 400 })

    const admin = createAdminClient()
    const legacyId = profile.id
    for (const table of ["testimonials", "authors_interest_submission", "authors", "orders", "profiles"] as const) {
      const column = table === "profiles" ? "id" : "user_id"
      const { error } = await admin.from(table).delete().eq(column, legacyId)
      if (error) {
        console.error("Error deleting account data:", error)
        return NextResponse.json({ error: "Unable to delete your account data. Please try again." }, { status: 500 })
      }
    }

    try {
      const client = await clerkClient()
      await client.users.deleteUser(clerkUser.id)
    } catch (error) {
      console.error("Error deleting Clerk account:", error)
      return NextResponse.json({ error: "Your application data was removed, but the login account could not be deleted. Please try again." }, { status: 500 })
    }

    let emailSent = false
    try {
      const key = process.env.RESEND_API_KEY
      if (key) {
        const resend = new Resend(key)
        const name = escapeHtml(String(clerkUser.firstName || clerkUser.username || "there"))
        const { error } = await resend.emails.send({
          from: "no-reply@shoppersocean.com",
          to: email,
          subject: "Your Shoppers Ocean account has been deleted",
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b;"><p>Dear ${name},</p><p>Sorry to see you go ! ☹️☹️</p><p>Your account has been deleted successfully !</p><p>Regards,<br />Shoppers Ocean</p></div>`,
        })
        emailSent = !error
      }
    } catch (error) {
      console.error("Unexpected account deletion email error:", error)
    }
    return NextResponse.json({ success: true, emailSent })
  } catch (error) {
    console.error("Unexpected account deletion error:", error)
    return NextResponse.json({ error: "Unable to delete your account. Please try again." }, { status: 500 })
  }
}
