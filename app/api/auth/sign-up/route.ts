import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureAuthSchema, hashPassword, createSession } from "@/utils/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? body?.full_name ?? "").trim();
    const country = String(body?.country ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const mobile = String(body?.mobile ?? "").trim();
    const address = String(body?.address ?? "").trim();

    if (!name || !country || !email) {
      return NextResponse.json({ error: "Name, Country and Email are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 letters/digits." }, { status: 400 });
    }

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    await ensureAuthSchema(db);

    const existing = await db.prepare(
      "SELECT id FROM profiles WHERE lower(trim(email))=? LIMIT 1"
    ).bind(email).first<any>();

    if (existing) {
      return NextResponse.json({
        error: "An account with this email already exists. Please sign in or reset your password."
      }, { status: 409 });
    }

    const { salt, hash } = await hashPassword(password);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Build the insert from the columns that actually exist in the live D1 schema.
    // This keeps signup compatible with the existing production profiles table.
    const schema = await db.prepare("PRAGMA table_info(profiles)").all<any>();
    const columns = new Set((schema.results ?? []).map((row: any) => String(row.name)));

    const values: Record<string, unknown> = {
      id,
      email,
      full_name: name,
      country,
      mobile: mobile || null,
      address: address || null,
      password_hash: hash,
      password_salt: salt,
      created_at: now,
      updated_at: now,
      role: "user",
      userrole: "USER",
      is_admin: 0,
      is_author: 0,
      isAuthor: 0,
      email_verified: 0,
      phone_verified: 0,
      status: "active",
    };

    const insertColumns = Object.keys(values).filter((column) => columns.has(column));
    const insertValues = insertColumns.map((column) => values[column]);

    if (!insertColumns.includes("id") || !insertColumns.includes("email") ||
        !insertColumns.includes("password_hash") || !insertColumns.includes("password_salt")) {
      throw new Error("Profiles schema is missing required authentication columns");
    }

    const placeholders = insertColumns.map(() => "?").join(",");
    await db.prepare(
      `INSERT INTO profiles (${insertColumns.join(",")}) VALUES (${placeholders})`
    ).bind(...insertValues).run();

    await createSession(id);
    return NextResponse.json({ success: true }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
