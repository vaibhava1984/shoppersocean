import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureBookPricingTable, getVisitorCountry } from "@/utils/book-pricing";

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
    // India uses INR; every overseas visitor uses the admin-entered USD price.
    // Legacy EUR/CNY/RUB columns, if present in an older D1 database, are ignored.
    const pricing = await db.prepare(
      "SELECT price_inr,price_usd FROM book_pricing WHERE book_id=? LIMIT 1"
    ).bind(bookId).first<any>();
    const country = getVisitorCountry(request);
    const currency = country === "IN" ? "INR" : "USD";
    const amount = currency === "INR"
      ? (Number(pricing?.price_inr) > 0 ? Number(pricing.price_inr) : Number(book.price))
      : Number(pricing?.price_usd);
    return Number.isFinite(amount) && amount > 0
      ? response({ country, currency, amount })
      : response({ country, currency, amount: null, unavailable: true });
  } catch (error) {
    console.error("Book pricing GET:", error);
    return NextResponse.json({ error: "Unable to calculate the book price" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
