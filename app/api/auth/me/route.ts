import { NextResponse } from "next/server";
import { getSessionUser } from "@/utils/auth/server";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json(
    { data: { user }, error: null },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
