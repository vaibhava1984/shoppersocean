import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { fetchExchangeRates, getCurrencyCode } from "@/utils/currency";
import { convertPrice, ensureBookPricingTable, getVisitorCountry } from "@/utils/book-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId")?.trim();
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    await ensureBookPricingTable(db);

    const book = await db.prepare(
      "SELECT id, price FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1"
    ).bind(bookId).first<any>();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const pricing = await db.prepare(
      "SELECT price_inr,price_usd,price_eur,price_cny FROM book_pricing WHERE book_id=? LIMIT 1"
    ).bind(bookId).first<any>();
    const country = getVisitorCountry(request);
    const legacyINR = Number(book.price);
    const rates = await fetchExchangeRates();
    const validRates = Boolean(rates?.INR && rates?.USD);

    // Legacy books remain displayable until their four prices are entered in the admin panel.
    const priceINR = Number(pricing?.price_inr) > 0 ? Number(pricing.price_inr) : legacyINR;
    const priceUSD = Number(pricing?.price_usd) > 0
      ? Number(pricing.price_usd)
      : (validRates ? convertPrice(priceINR, "INR", "USD", rates) : null);

    if (country === "IN" && priceINR > 0) {
      return NextResponse.json({ country, currency: "INR", amount: priceINR }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
    }
    if (!country || country === "US") {
      return NextResponse.json({ country, currency: "USD", amount: priceUSD, unavailable: !(priceUSD && priceUSD > 0) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
    }

    const domesticCurrency = getCurrencyCode(country);
    if (domesticCurrency === "EUR" || domesticCurrency === "CNY") {
      const dedicated = domesticCurrency === "EUR" ? Number(pricing?.price_eur) : Number(pricing?.price_cny);
      if (dedicated > 0) {
        return NextResponse.json({ country, currency: domesticCurrency, amount: dedicated }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
      }
      const converted = priceUSD && validRates ? convertPrice(priceUSD, "USD", domesticCurrency, rates) : null;
      if (converted) return NextResponse.json({ country, currency: domesticCurrency, amount: converted }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
      return NextResponse.json({ country, currency: "USD", amount: priceUSD, unavailable: !(priceUSD && priceUSD > 0) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
    }

    if (domesticCurrency === "Unknown" || !domesticCurrency || !priceUSD || !validRates) {
      return NextResponse.json({ country, currency: "USD", amount: priceUSD, unavailable: !(priceUSD && priceUSD > 0) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
    }
    const converted = convertPrice(priceUSD, "USD", domesticCurrency, rates);
    return NextResponse.json(
      converted
        ? { country, currency: domesticCurrency, amount: converted }
        : { country, currency: "USD", amount: priceUSD, unavailable: !(priceUSD && priceUSD > 0) },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Book pricing GET:", error);
    return NextResponse.json({ error: "Unable to calculate the book price" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
