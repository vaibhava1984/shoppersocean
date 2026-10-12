import { NextResponse } from "next/server";
import { getExchangeRatesWithFallback } from "@/utils/serverExchangeRates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await getExchangeRatesWithFallback();
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Exchange-rate endpoint could not obtain a valid rate.", error);
    return NextResponse.json({
      error: "Exchange rates are temporarily unavailable. Please try again shortly.",
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
