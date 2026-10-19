import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { fetchExchangeRates, getCurrencyCode } from "@/utils/currency";
import { convertPrice, ensureBookPricingTable, getVisitorCountry } from "@/utils/book-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId")?.trim();
    if (!bookId) return response({ error: "Book ID is required" }, 400);

    const db = getD1();
    if (!db) return response({ error: "Cloudflare database is unavailable" }, 503);

    await ensureBookPricingTable(db);
    const book = await db.prepare(
      "SELECT id, price FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
    ).bind(bookId).first<any>();
    if (!book) return response({ error: "Book not found" }, 404);

    const pricing = await db.prepare(
      "SELECT price_inr,price_usd,price_eur,price_cny,price_rub FROM book_pricing WHERE book_id=? LIMIT 1"
    ).bind(bookId).first<any>();

    const country = getVisitorCountry(request);
    const priceINR = Number(pricing?.price_inr) > 0 ? Number(pricing.price_inr) : Number(book.price);
    const savedUSD = Number(pricing?.price_usd) > 0 ? Number(pricing.price_usd) : null;
    const savedEUR = Number(pricing?.price_eur) > 0 ? Number(pricing.price_eur) : null;
    const savedCNY = Number(pricing?.price_cny) > 0 ? Number(pricing.price_cny) : null;
    const savedRUB = Number(pricing?.price_rub) > 0 ? Number(pricing.price_rub) : null;
    const domesticCurrency = country ? getCurrencyCode(country) : null;

    // These five currencies always use the administrator's exact per-book price.
    if (domesticCurrency === "INR") {
      return priceINR > 0
        ? response({ country, currency: "INR", amount: priceINR })
        : response({ country, currency: "INR", amount: null, unavailable: true });
    }
    if (domesticCurrency === "USD") {
      return savedUSD
        ? response({ country, currency: "USD", amount: savedUSD })
        : response({ country, currency: "USD", amount: null, unavailable: true });
    }
    if (domesticCurrency === "EUR") {
      return savedEUR
        ? response({ country, currency: "EUR", amount: savedEUR })
        : response({ country, currency: "EUR", amount: null, unavailable: true });
    }
    if (domesticCurrency === "CNY") {
      return savedCNY
        ? response({ country, currency: "CNY", amount: savedCNY })
        : response({ country, currency: "CNY", amount: null, unavailable: true });
    }
    if (domesticCurrency === "RUB") {
      return savedRUB
        ? response({ country, currency: "RUB", amount: savedRUB })
        : response({ country, currency: "RUB", amount: null, unavailable: true });
    }

    // All other known geographies use their local currency converted from the manually
    // configured USD price. Never silently substitute INR/USD when a conversion rate is missing.
    if (!savedUSD) {
      return response({ country, currency: domesticCurrency || "USD", amount: null, unavailable: true });
    }
    if (!domesticCurrency) {
      return response({ country: null, currency: "USD", amount: savedUSD });
    }
    const rates = await fetchExchangeRates();
    const converted = convertPrice(savedUSD, "USD", domesticCurrency, rates);
    return converted
      ? response({ country, currency: domesticCurrency, amount: converted })
      : response({ country, currency: domesticCurrency, amount: null, unavailable: true });
  } catch (error) {
    console.error("Book pricing GET:", error);
    return NextResponse.json({ error: "Unable to calculate the book price" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
