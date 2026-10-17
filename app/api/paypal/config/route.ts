import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "PayPal checkout is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  // The PayPal Client ID is public by design. The Secret is never returned.
  return NextResponse.json(
    { clientId },
    { headers: { "Cache-Control": "no-store" } }
  );
}
