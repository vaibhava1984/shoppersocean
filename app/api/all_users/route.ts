import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function POST() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const { results = [] } = await db.prepare(
      "SELECT id,email,full_name,country,phone,address,role,email_confirmed,created_at,updated_at FROM users ORDER BY created_at DESC"
    ).all<any>();

    return NextResponse.json({
      users: results.map((u) => ({
        id: String(u.id),
        email: u.email || "",
        phone: u.phone || null,
        created_at: u.created_at,
        updated_at: u.updated_at,
        email_confirmed: Boolean(u.email_confirmed),
        app_metadata: { userrole: String(u.role || "").toUpperCase() || undefined },
        user_metadata: {
          full_name: u.full_name || "",
          country: u.country || "",
          address: u.address || "",
          phone: u.phone || "",
        },
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin users:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
