import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { fetchExchangeRates, getCurrencyCode } from "@/utils/currency";
import { convertPrice, ensureBookPricingTable, getVisitorCountry } from "@/utils/book-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function response(body: Record<string, unknown>) {
  return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId")?.trim();
    if (!bookId) return response({ error: "Book ID is required" });

    const db = getD1();
    if (!db) return response({ error: "Cloudflare database is unavailable" });

    await ensureBookPricingTable(db);
    const book = await db.prepare(
      "SELECT id, price FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
    ).bind(bookId).first<any>();
    if (!book) return response({ error: "Book not found" });

    const pricing = await db.prepare(
      "SELECT price_inr,price_usd,price_eur,price_cny FROM book_pricing WHERE book_id=? LIMIT 1"
    ).bind(bookId).first<any>();

    const country = getVisitorCountry(request);
    const priceINR = Number(pricing?.price_inr) > 0 ? Number(pricing.price_inr) : Number(book.price);
    const savedUSD = Number(pricing?.price_usd) > 0 ? Number(pricing.price_usd) : null;
    const savedEUR = Number(pricing?.price_eur) > 0 ? Number(pricing.price_eur) : null;
    const savedCNY = Number(pricing?.price_cny) > 0 ? Number(pricing.price_cny) : null;

    // The four chosen geographies use their own manually configured per-book prices.
    if (country === "IN" && priceINR > 0) return response({ country, currency: "INR", amount: priceINR });
    if (country === "US" && savedUSD) return response({ country, currency: "USD", amount: savedUSD });

    const domesticCurrency = country ? getCurrencyCode(country) : "USD";
    if (domesticCurrency === "EUR" && savedEUR) return response({ country, currency: "EUR", amount: savedEUR });
    if (domesticCurrency === "CNY" && savedCNY) return response({ country, currency: "CNY", amount: savedCNY });

    // Only request rates when a legacy book needs a USD fallback or a visitor needs conversion.
    let rates: Record<string, number> = {};
    let priceUSD = savedUSD;
    const needsRates = !priceUSD || (domesticCurrency !== "USD");
    if (needsRates) {
      rates = await fetchExchangeRates();
      if (!priceUSD && rates.INR && rates.USD) {
        priceUSD = convertPrice(priceINR, "INR", "USD", rates);
      }
    }

    if (!priceUSD || priceUSD <= 0) {
      return response({ country, currency: "USD", amount: null, unavailable: true });
    }

    // Unknown geography, USD geography, or unavailable exchange rates use the configured USD price.
    if (!country || domesticCurrency === "USD" || !rates.USD || !rates[domesticCurrency]) {
      return response({ country, currency: "USD", amount: priceUSD });
    }

    // EUR/CNY visitors use their separately configured prices above; until an existing book is
    // edited, derive those missing prices from its USD price rather than imposing a fixed price.
    const converted = convertPrice(priceUSD, "USD", domesticCurrency, rates);
    return converted
      ? response({ country, currency: domesticCurrency, amount: converted })
      : response({ country, currency: "USD", amount: priceUSD });
  } catch (error) {
    console.error("Book pricing GET:", error);
    return NextResponse.json({ error: "Unable to calculate the book price" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
