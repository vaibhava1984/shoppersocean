import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getD1 } from "@/utils/cloudflare/d1";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalized = String(email ?? "").trim().toLowerCase();
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const { env } = await getCloudflareContext();
    const resendApiKey = String((env as any).RESEND_API_KEY ?? "").trim();
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured in the Cloudflare Worker environment.");
      return NextResponse.json({ error: "Password reset email service is temporarily unavailable." }, { status: 503 });
    }

    const user = await db.prepare("SELECT id,full_name,email FROM profiles WHERE lower(email)=? LIMIT 1").bind(normalized).first<any>();

    if (user) {
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
      const tokenHash = Array.from(new Uint8Array(hash), x => x.toString(16).padStart(2, "0")).join("");
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

      await db.prepare("DELETE FROM password_reset_tokens WHERE user_id=? AND used_at IS NULL").bind(user.id).run();
      await db.prepare("INSERT INTO password_reset_tokens(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)")
        .bind(crypto.randomUUID(), user.id, tokenHash, expires, now.toISOString()).run();

      const url = `https://www.shoppersocean.com/reset-password?token=${encodeURIComponent(token)}`;
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: normalized,
        subject: "Reset your Shoppers Ocean password",
        html: `<p>Dear ${String(user.full_name || "Customer").replace(/[<>]/g, "")},</p><p>Use the link below to reset your Shoppers Ocean password. It expires in 30 minutes.</p><p><a href="${url}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p><p>Regards,<br/>Shoppers Ocean</p>`,
      });

      if (error) {
        console.error("Resend password reset error:", error);
        return NextResponse.json({ error: "Unable to send the password reset email right now." }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, message: "If an account exists for that email, a password reset link has been sent." });
  } catch (e) {
    console.error("Password reset request error:", e);
    return NextResponse.json({ error: "Unable to process the password reset request." }, { status: 500 });
  }
}
