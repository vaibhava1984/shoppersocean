/** Lazily create the two-currency pricing table for existing Cloudflare D1 databases. */
let pricingTableReady: Promise<void> | null = null;

export async function ensureBookPricingTable(db: any) {
  if (pricingTableReady) return pricingTableReady;
  pricingTableReady = db.prepare(`
    CREATE TABLE IF NOT EXISTS book_pricing (
      book_id TEXT PRIMARY KEY,
      price_inr REAL,
      price_usd REAL,
      updated_at TEXT NOT NULL
    )
  `).run().then(() => undefined).catch((error: unknown) => {
    pricingTableReady = null;
    throw error;
  });
  return pricingTableReady;
}

export function getVisitorCountry(request: Request): string | null {
  const raw = (request.headers.get("cf-ipcountry") || request.headers.get("x-country-code") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(raw) && raw !== "XX" && raw !== "T1" ? raw : null;
}
