import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { COUNTRIES } from "@/utils/countries";

export async function POST() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    // Keep the admin Users list consistent with sign-in eligibility:
    // pending registrations must not appear until their email is confirmed.
    const { results = [] } = await db.prepare(
      "SELECT u.id,u.email,u.full_name,u.country,COALESCE(NULLIF(TRIM(u.city),''),(SELECT NULLIF(TRIM(aa.city),'') FROM author_applications aa WHERE aa.user_id=u.id ORDER BY aa.created_at DESC LIMIT 1)) AS city,u.phone,COALESCE(NULLIF(TRIM(u.address),''),(SELECT NULLIF(TRIM(p.address),'') FROM profiles p WHERE p.id=u.id LIMIT 1)) AS address,u.role,u.email_confirmed,u.created_at,u.updated_at FROM users u WHERE COALESCE(u.email_confirmed,0)=1 ORDER BY u.created_at DESC"
    ).all<any>();

    return NextResponse.json({
      users: results.map((u) => {
        const countryName = COUNTRIES.find((country) => country.code === String(u.country || "").toUpperCase())?.name || u.country || "";
        const territory = [u.city || "City not provided", u.address, countryName].filter((value, index, values) => Boolean(value) && values.indexOf(value) === index).join(", ");
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
          city: u.city || "",
          address: u.address || "",
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
