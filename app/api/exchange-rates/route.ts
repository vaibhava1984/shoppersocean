import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_STALE_AGE_MS = 24 * 60 * 60 * 1000;
const PROVIDERS = [
  "https://api.exchangerate-api.com/v4/latest/INR",
  "https://open.er-api.com/v6/latest/INR",
];

type Rates = Record<string, number>;
type CachedRatesRow = { rates_json: string; fetched_at: number };

function isValidRates(value: unknown): value is Rates {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rates = value as Record<string, unknown>;
  return typeof rates.USD === "number" && Number.isFinite(rates.USD) && rates.USD > 0;
}

async function fetchLiveRates(): Promise<Rates> {
  let lastError: unknown;
  for (const endpoint of PROVIDERS) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
      const data = await response.json() as { result?: string; rates?: unknown };
      if (data.result === "error" || !isValidRates(data.rates)) {
        throw new Error("Provider returned invalid exchange-rate data");
      }
      return data.rates;
    } catch (error) {
      lastError = error;
      console.warn("Exchange-rate provider failed; trying backup provider.", error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All exchange-rate providers failed");
}

export async function GET() {
  const db = getD1();
  let cached: CachedRatesRow | null = null;

  // The table is created lazily so this change does not require a separate D1 migration.
  if (db) {
    try {
      await db.prepare(
        "CREATE TABLE IF NOT EXISTS exchange_rate_cache (base_currency TEXT PRIMARY KEY, rates_json TEXT NOT NULL, fetched_at INTEGER NOT NULL)"
      ).run();
      cached = await db.prepare(
        "SELECT rates_json, fetched_at FROM exchange_rate_cache WHERE base_currency = ? LIMIT 1"
      ).bind("INR").first<CachedRatesRow>();
    } catch (error) {
      console.warn("Shared exchange-rate cache is unavailable; live providers will still be tried.", error);
    }
  }

  try {
    const rates = await fetchLiveRates();
    if (db) {
      try {
        await db.prepare(
          "INSERT INTO exchange_rate_cache (base_currency, rates_json, fetched_at) VALUES (?, ?, ?) ON CONFLICT(base_currency) DO UPDATE SET rates_json = excluded.rates_json, fetched_at = excluded.fetched_at"
        ).bind("INR", JSON.stringify(rates), Date.now()).run();
      } catch (error) {
        console.warn("Could not save exchange rates to D1; returning the valid live rate.", error);
      }
    }
    return NextResponse.json({ rates, source: "live", fetchedAt: Date.now() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Live exchange-rate providers failed.", error);
  }

  if (cached) {
    const ageMs = Date.now() - Number(cached.fetched_at);
    try {
      const rates: unknown = JSON.parse(cached.rates_json);
      if (ageMs >= 0 && ageMs <= MAX_STALE_AGE_MS && isValidRates(rates)) {
        return NextResponse.json({
          rates,
          source: "shared-cache",
          fetchedAt: Number(cached.fetched_at),
          stale: true,
        }, { headers: { "Cache-Control": "no-store" } });
      }
    } catch (error) {
      console.warn("Ignoring invalid cached exchange rates.", error);
    }
  }

  return NextResponse.json({
    error: "Exchange rates are temporarily unavailable. Please try again shortly.",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
