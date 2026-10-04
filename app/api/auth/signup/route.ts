import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureAuthSchema, hashPassword, createSession, getCurrentUser } from "@/utils/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const fullName = String(body?.full_name ?? "").trim();
    const country = String(body?.country ?? "").trim();
    const mobile = String(body?.mobile ?? "").trim();
    const address = String(body?.address ?? "").trim();

    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureAuthSchema(db);

    const existing = await db.prepare("SELECT id FROM profiles WHERE lower(trim(email))=? LIMIT 1").bind(email).first<any>();
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const { salt, hash } = await hashPassword(password);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.prepare(
      "INSERT INTO profiles (id,email,password_hash,password_salt,full_name,country,mobile,address,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(id,email,hash,salt,fullName || null,country || null,mobile || null,address || null,now,now).run();

    await createSession(id);
    const user = await getCurrentUser();
    return NextResponse.json({ user }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
