import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { getCurrentUser } from "@/utils/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    if (email !== "kochimonu@gmail.com") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    }

    const result = await db.prepare("SELECT COUNT(*) AS total_users FROM profiles").first<any>();
    return NextResponse.json({ total_users: Number(result?.total_users ?? 0) });
  } catch (error) {
    console.error("Temporary user-count diagnostic error:", error);
    return NextResponse.json({ error: "Unable to read user count" }, { status: 500 });
  }
}
