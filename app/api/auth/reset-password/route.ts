import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureAuthSchema, hashPassword, createSession } from "@/utils/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function hashToken(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const resetToken = String(token ?? "").trim();
    const nextPassword = String(password ?? "");

    if (!resetToken) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    if (nextPassword.length < 6) {
      return NextResponse.json({ error: "Password must contain at least 6 letters/digits." }, { status: 400 });
    }

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    await ensureAuthSchema(db);

    const row = await db.prepare(
      "SELECT id,user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1"
    ).bind(await hashToken(resetToken), new Date().toISOString()).first<any>();

    if (!row) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });

    const { salt, hash } = await hashPassword(nextPassword);
    const now = new Date().toISOString();

    await db.prepare(
      "UPDATE profiles SET password_hash=?,password_salt=?,updated_at=? WHERE id=?"
    ).bind(hash, salt, now, row.user_id).run();

    await db.prepare("UPDATE password_reset_tokens SET used_at=? WHERE id=?").bind(now, row.id).run();
    await db.prepare("DELETE FROM auth_sessions WHERE user_id=?").bind(row.user_id).run();
    await createSession(String(row.user_id));

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Unable to reset your password." }, { status: 500 });
  }
}
