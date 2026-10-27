import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Match the synchronous Cloudflare context access used by the other
    // working API routes in this OpenNext Worker.
    const { env } = getCloudflareContext();
    const clientId = String((env as any).PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "").trim();

    if (!clientId) {
      console.error("PayPal Client ID is not available in the active production runtime");
      return NextResponse.json(
        { error: "PayPal checkout is temporarily unavailable. Please try again shortly.", code: "PAYPAL_CLIENT_ID_UNAVAILABLE" },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { clientId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Unable to read PayPal runtime configuration:", error);
    return NextResponse.json(
      { error: "PayPal checkout is temporarily unavailable. Please try again shortly.", code: "PAYPAL_RUNTIME_CONTEXT_ERROR" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
