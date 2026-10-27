import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Use the asynchronous OpenNext context API inside a request handler.
    const { env } = await getCloudflareContext({ async: true });
    const clientId = String((env as any).PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "").trim();

    if (!clientId) {
      console.error("PayPal client ID binding is unavailable in the Worker runtime");
      return NextResponse.json(
        { error: "PayPal checkout is temporarily unavailable. Please try again shortly." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Client ID is public by design; never return the client secret.
    return NextResponse.json(
      { clientId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Unable to read PayPal runtime configuration:", error);
    return NextResponse.json(
      { error: "PayPal checkout is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
