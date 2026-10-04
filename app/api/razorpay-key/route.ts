import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const keyId = String((env as any).RAZORPAY_KEY_ID ?? "").trim();
    if (!keyId) return NextResponse.json({ error: "Razorpay public key is not configured." }, { status: 500, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ keyId }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Razorpay public key is unavailable." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
