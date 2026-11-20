import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";

export async function POST() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    // Author applications contain the city supplied during author registration.
    // Create the table defensively so this query also works on installations
    // where no author has submitted an application yet.
    await db.prepare(`CREATE TABLE IF NOT EXISTS author_applications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
      full_name TEXT NOT NULL, email TEXT NOT NULL, city TEXT NOT NULL,
      country TEXT NOT NULL, age INTEGER NOT NULL, gender TEXT NOT NULL,
      paypal_id TEXT, upi_number TEXT, status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL, reviewed_at TEXT, approved_at TEXT,
      payment_deadline TEXT, payment_order_id TEXT, payment_id TEXT,
      payment_currency TEXT, payment_amount REAL
    )`).run();

    const { results = [] } = await db.prepare(
      `SELECT u.id,u.email,u.full_name,u.country,u.phone,u.address,u.role,
        u.email_confirmed,u.created_at,u.updated_at,
        (SELECT TRIM(COALESCE(a.city,'') || CASE WHEN a.city IS NOT NULL AND a.city<>'' AND a.country IS NOT NULL AND a.country<>'' THEN ', ' ELSE '' END || COALESCE(a.country,''))
         FROM author_applications a WHERE a.user_id=u.id
         ORDER BY a.created_at DESC LIMIT 1) AS author_territory
       FROM users u
       WHERE COALESCE(u.email_confirmed,0)=1
       ORDER BY u.created_at DESC`
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
          territory: u.author_territory || [u.address, u.country].filter(Boolean).join(", ") || u.country || "Not provided",
          phone: u.phone || "",
        },
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin users:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
