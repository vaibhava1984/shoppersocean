import { NextResponse } from "next/server"
import { Resend } from "resend"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const clerkEnabled =
      process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
      Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
      Boolean(process.env.CLERK_SECRET_KEY)

    if (clerkEnabled) {
      const { userId } = await auth()
      const clerkUser = await currentUser()
      if (!userId || !clerkUser) {
        return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
      }

      const { password } = await request.json()
      const newPassword = String(password ?? "")

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Clerk requires a password of at least 8 characters." }, { status: 400 })
      }

      const client = await clerkClient()
      await client.users.updateUser(userId, {
        password: newPassword,
        signOutOfOtherSessions: false,
      })

      const email = clerkUser.emailAddresses[0]?.emailAddress
      if (!email) {
        return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully." })
      }

      const resendApiKey = process.env.RESEND_API_KEY
      if (!resendApiKey) {
        return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully." })
      }

      const resend = new Resend(resendApiKey)
      const safeName = String(clerkUser.fullName || "Customer")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

      const { error: emailError } = await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: email,
        subject: "Your Shoppers Ocean password has been changed successfully",
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <p>Dear ${safeName},</p>
          <p>Your Shoppers Ocean password has been changed successfully.</p>
          <p>If you made this change, no further action is required.</p>
          <p>If you did not make this change, please contact Shoppers Ocean support immediately.</p>
          <p>Regards,<br />Shoppers Ocean</p>
        </div>`,
      })

      return NextResponse.json({
        success: true,
        emailSent: !emailError,
        message: emailError
          ? "Your password has been changed successfully, but the confirmation email could not be sent."
          : "Your password has been changed successfully. A confirmation email has been sent to your email address.",
      })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })

    const { password } = await request.json()
    const newPassword = String(password ?? "")
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must contain at least 6 letters/digits." }, { status: 400 })

    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
    if (passwordError) return NextResponse.json({ error: passwordError.message || "Unable to change your password." }, { status: 422 })

    const email = user.email
    if (!email) return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully." })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const safeName = String(user.user_metadata?.full_name || "Customer").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const { error: emailError } = await resend.emails.send({
      from: "no-reply@shoppersocean.com", to: email,
      subject: "Your Shoppers Ocean password has been changed successfully",
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;"><p>Dear ${safeName},</p><p>Your Shoppers Ocean password has been changed successfully.</p><p>If you made this change, no further action is required.</p><p>If you did not make this change, please contact Shoppers Ocean support immediately.</p><p>Regards,<br />Shoppers Ocean</p></div>`,
    })
    return NextResponse.json({ success: true, emailSent: !emailError, message: emailError ? "Your password has been changed successfully, but the confirmation email could not be sent." : "Your password has been changed successfully. A confirmation email has been sent to your email address." })
  } catch (error: any) {
    console.error("Unexpected password change error:", error)
    return NextResponse.json({ error: error?.errors?.[0]?.message || error?.message || "Unable to change your password right now. Please try again." }, { status: 500 })
  }
}
