import { NextResponse } from "next/server";
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const rows = await db.prepare(
      "SELECT o.*, b.id AS book_id, b.title AS book_title, b.price AS book_price, " +
      "p.original_amount, p.original_currency, p.payment_method " +
      "FROM orders o LEFT JOIN books b ON b.id = o.product_id " +
      "LEFT JOIN payments p ON p.order_id = o.id " +
      "WHERE o.user_id = ? ORDER BY o.order_date DESC"
    ).bind(identity.profile.id).all<Record<string, any>>();

    const purchases = rows.results.map((row) => ({
      ...row,
      books: row.book_id ? { id: row.book_id, title: row.book_title, price: row.book_price } : null,
      payment: row.original_amount != null ? {
        original_amount: row.original_amount,
        original_currency: row.original_currency,
        payment_method: row.payment_method
      } : null
    }));
    return NextResponse.json(purchases, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error loading purchases:", error);
    return NextResponse.json({ error: "Error loading purchases" }, { status: 500 });
  }
}
