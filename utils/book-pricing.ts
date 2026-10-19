import type { ExchangeRates } from "@/utils/currency";

/** Create the separate pricing table lazily so existing Cloudflare D1 databases need no manual migration. */
let pricingTableReady: Promise<void> | null = null;

export async function ensureBookPricingTable(db: any) {
  if (pricingTableReady) return pricingTableReady;
  pricingTableReady = db.prepare(`
    CREATE TABLE IF NOT EXISTS book_pricing (
      book_id TEXT PRIMARY KEY,
      price_inr REAL,
      price_usd REAL,
      price_eur REAL,
      price_cny REAL,
      updated_at TEXT NOT NULL
    )
  `).run().then(() => undefined).catch((error: unknown) => {
    pricingTableReady = null;
    throw error;
  });
  return pricingTableReady;
}

export function convertPrice(amount: number, from: string, to: string, rates: ExchangeRates): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (from === to) return amount;
  if (!rates[from] || !rates[to]) return null;
  const converted = amount / rates[from] * rates[to];
  return Number.isFinite(converted) && converted > 0 ? converted : null;
}

export function getVisitorCountry(request: Request): string | null {
  const raw = (request.headers.get("cf-ipcountry") || request.headers.get("x-country-code") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(raw) && raw !== "XX" && raw !== "T1" ? raw : null;
}
