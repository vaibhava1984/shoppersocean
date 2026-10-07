import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { COUNTRIES } from "@/utils/countries";

export async function GET() {
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
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
