import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth()
    if (!isAuthenticated || !userId) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    const { password } = await request.json()
    const newPassword = String(password ?? "")
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must contain at least 6 letters/digits." }, { status: 400 })

    const client = await clerkClient()
    await client.users.updateUser(userId, { password: newPassword, signOutOfOtherSessions: false })

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    if (!email) return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully." })

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully." })

    const safeName = String(user?.firstName || user?.username || "Customer").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const resend = new Resend(resendApiKey)
    const { error: emailError } = await resend.emails.send({
      from: "no-reply@shoppersocean.com",
      to: email,
      subject: "Your Shoppers Ocean password has been changed successfully",
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;"><p>Dear ${safeName},</p><p>Your Shoppers Ocean password has been changed successfully.</p><p>If you made this change, no further action is required.</p><p>If you did not make this change, please contact Shoppers Ocean support immediately.</p><p>Regards,<br />Shoppers Ocean</p></div>`,
    })
    if (emailError) return NextResponse.json({ success: true, emailSent: false, message: "Your password has been changed successfully, but the confirmation email could not be sent." })
    return NextResponse.json({ success: true, emailSent: true, message: "Your password has been changed successfully. A confirmation email has been sent to your email address." })
  } catch (error) {
    console.error("Unexpected password change error:", error)
    return NextResponse.json({ error: "Unable to change your password right now. Please try again." }, { status: 500 })
  }
}
