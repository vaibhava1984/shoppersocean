import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getCurrentUser, hashPassword } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    const { password } = await request.json();
    const newPassword = String(password ?? "");
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must contain at least 6 letters/digits." }, { status: 400 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await db.prepare("UPDATE profiles SET password_hash=?, updated_at=? WHERE id=?").bind(await hashPassword(newPassword), new Date().toISOString(), String(user.id)).run();
    let emailSent = false;
    const email = String(user.email ?? "");
    const key = process.env.RESEND_API_KEY;
    if (key && email) {
      const resend = new Resend(key);
      const safeName = String(user.full_name || "Customer").replace(/[&<>]/g, "");
      const { error } = await resend.emails.send({ from: "no-reply@shoppersocean.com", to: email, subject: "Your Shoppers Ocean password has been changed successfully", html: `<p>Dear ${safeName},</p><p>Your Shoppers Ocean password has been changed successfully.</p><p>Regards,<br/>Shoppers Ocean</p>` });
      emailSent = !error;
    }
    return NextResponse.json({ success: true, emailSent, message: emailSent ? "Your password has been changed successfully. A confirmation email has been sent to your email address." : "Your password has been changed successfully." });
  } catch (error) {
    console.error("Unexpected password change error:", error);
    return NextResponse.json({ error: "Unable to change your password right now. Please try again." }, { status: 500 });
  }
}