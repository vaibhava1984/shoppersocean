import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { COUNTRIES } from "@/utils/countries";
import { getD1 } from "@/utils/cloudflare/d1";

export async function GET() {
  const db = getD1();
  if (db) { for (const column of ["gender TEXT", "city TEXT"]) { try { await db.prepare("ALTER TABLE users ADD COLUMN " + column).run(); } catch {} } }
  const identity = await requireUser();
  if (!identity) return NextResponse.json({ error: "Please sign in to register as an author." }, { status: 401 });
  const country = COUNTRIES.find((c) => c.code === String(identity.profile.country ?? "").toUpperCase())?.name
    || identity.profile.country
    || "";
  return NextResponse.json({
    profile: {
      fullName: identity.profile.full_name || "",
      email: identity.profile.email,
      country,
      gender: identity.profile.gender || "",
      city: identity.profile.city || "",
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
