import { NextResponse } from "next/server";
import { getBookFileUrl } from "@/utils/storage";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key." }, { status: 400 });
  return NextResponse.json({ url: await getBookFileUrl(key) });
}
