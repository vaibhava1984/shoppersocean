import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureAuthSchema, verifyPassword, createSession, getCurrentUser } from "@/utils/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const normalized = String(email ?? "").trim().toLowerCase();
    const secret = String(password ?? "");
    if (!normalized || !secret) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureAuthSchema(db);

    const user = await db.prepare(
      "SELECT id,email,password_hash,password_salt,full_name,country,mobile,address FROM profiles WHERE lower(trim(email))=? LIMIT 1"
    ).bind(normalized).first<any>();

    if (!user) return NextResponse.json({ error: "Invalid email or password", code: "invalid_credentials" }, { status: 401 });
    if (String(user.password_hash || "") === "RESET_REQUIRED") {
      return NextResponse.json({
        error: "This account needs a password reset before you can sign in.",
        code: "password_reset_required",
        resetRequired: true,
        email: user.email,
      }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    if (!user.password_hash || !user.password_salt) {
      return NextResponse.json({
        error: "This account needs a password reset before you can sign in.",
        code: "password_reset_required",
        resetRequired: true,
        email: user.email,
      }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const valid = await verifyPassword(secret, String(user.password_salt), String(user.password_hash));
    if (!valid) return NextResponse.json({ error: "Invalid email or password", code: "invalid_credentials" }, { status: 401 });

    await db.prepare("DELETE FROM auth_sessions WHERE user_id=?").bind(user.id).run();
    await createSession(String(user.id));
    const current = await getCurrentUser();

    return NextResponse.json({ user: current }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
