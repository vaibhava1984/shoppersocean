import { getD1 } from "@/utils/cloudflare/d1";

const FRESH_CACHE_AGE_MS = 60 * 60 * 1000;
const MAX_STALE_AGE_MS = 24 * 60 * 60 * 1000;
const PROVIDERS = [
  "https://api.exchangerate-api.com/v4/latest/INR",
  "https://open.er-api.com/v6/latest/INR",
];

export type ExchangeRateResult = {
  rates: Record<string, number>;
  source: "live" | "shared-cache";
  fetchedAt: number;
  stale?: boolean;
};

type CachedRatesRow = { rates_json: string; fetched_at: number };

function isValidRates(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rates = value as Record<string, unknown>;
  return typeof rates.USD === "number" && Number.isFinite(rates.USD) && rates.USD > 0;
}

async function fetchLiveRates(): Promise<Record<string, number>> {
  let lastError: unknown;
  for (const endpoint of PROVIDERS) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
      const data = await response.json() as { result?: string; rates?: unknown };
      const rates = data.rates;
      if (data.result === "error" || !isValidRates(rates)) {
        throw new Error("Provider returned invalid exchange-rate data");
      }
      return rates;
    } catch (error) {
      lastError = error;
      console.warn("Exchange-rate provider failed; trying backup provider.", error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All exchange-rate providers failed");
}

function parseCachedRates(cached: CachedRatesRow): Record<string, number> | null {
  try {
    const rates: unknown = JSON.parse(cached.rates_json);
    return isValidRates(rates) ? rates : null;
  } catch {
    return null;
  }
}

export async function getExchangeRatesWithFallback(): Promise<ExchangeRateResult> {
  const db = getD1();
  let cached: CachedRatesRow | null = null;

  // Create the cache table lazily; no separate D1 migration is required.
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

  if (cached) {
    const ageMs = Date.now() - Number(cached.fetched_at);
    const rates = parseCachedRates(cached);
    if (rates && ageMs >= 0 && ageMs <= FRESH_CACHE_AGE_MS) {
      return { rates, source: "shared-cache", fetchedAt: Number(cached.fetched_at) };
    }
  }

  try {
    const rates = await fetchLiveRates();
    const fetchedAt = Date.now();
    if (db) {
      try {
        await db.prepare(
          "INSERT INTO exchange_rate_cache (base_currency, rates_json, fetched_at) VALUES (?, ?, ?) ON CONFLICT(base_currency) DO UPDATE SET rates_json = excluded.rates_json, fetched_at = excluded.fetched_at"
        ).bind("INR", JSON.stringify(rates), fetchedAt).run();
      } catch (error) {
        console.warn("Could not save exchange rates to D1; returning the valid live rate.", error);
      }
    }
    return { rates, source: "live", fetchedAt };
  } catch (error) {
    console.error("Live exchange-rate providers failed.", error);
  }

  if (cached) {
    const ageMs = Date.now() - Number(cached.fetched_at);
    const rates = parseCachedRates(cached);
    if (rates && ageMs >= 0 && ageMs <= MAX_STALE_AGE_MS) {
      return { rates, source: "shared-cache", fetchedAt: Number(cached.fetched_at), stale: true };
    }
  }

  throw new Error("Exchange rates are temporarily unavailable. Please try again shortly.");
}
