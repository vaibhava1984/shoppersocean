import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { COUNTRIES } from "@/utils/countries";

export async function POST() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    // Ensure the registration-location columns exist for older D1 databases.
    for (const column of ["registration_city TEXT", "registration_country TEXT"]) {
      try { await db.prepare(`ALTER TABLE users ADD COLUMN ${column}`).run(); } catch {}
    }
    // Only display location supplied by Cloudflare at account creation, never
    // a city typed by the user or a city entered later in an author application.
    const { results = [] } = await db.prepare(
      "SELECT u.id,u.email,u.full_name,u.registration_city,u.registration_country,u.phone,u.role,u.email_confirmed,u.created_at,u.updated_at FROM users u WHERE COALESCE(u.email_confirmed,0)=1 ORDER BY u.created_at DESC"
    ).all<any>();

    return NextResponse.json({
      users: results.map((u) => {
        const registrationCountry = String(u.registration_country || "").toUpperCase();
        const countryName = COUNTRIES.find((country) => country.code === registrationCountry)?.name || registrationCountry;
        const registrationCity = String(u.registration_city || "").trim();
        const territory = [registrationCity, countryName].filter(Boolean).join(", ") || "Not captured at registration";
        return ({
        id: String(u.id),
        email: u.email || "",
        phone: u.phone || null,
        created_at: u.created_at,
        updated_at: u.updated_at,
        email_confirmed: Boolean(u.email_confirmed),
        app_metadata: { userrole: String(u.role || "").toUpperCase() || undefined },
        user_metadata: {
          full_name: u.full_name || "",
          country: countryName,
          city: registrationCity,
          address: "",
          territory: territory || "Not provided",
          phone: u.phone || "",
        },
      });
      })
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin users:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
