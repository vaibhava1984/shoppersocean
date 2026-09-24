import { NextResponse } from "next/server";
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const url = new URL(req.url);
    const authorId = url.searchParams.get("authorId");
    const timeFrame = url.searchParams.get("timeFrame") || "month";
    if (!authorId) return NextResponse.json({ error: "Author ID is required" }, { status: 400 });

    const owned = await db.prepare(
      "SELECT author_id FROM authors WHERE author_id = ? AND user_id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(authorId, identity.profile.id).first();
    if (!owned) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const books = await db.prepare(
      "SELECT id, title FROM books WHERE author_id = ? AND COALESCE(is_deleted, 0) = 0"
    ).bind(authorId).all<Record<string, any>>();

    const bookIds = books.results.map((b) => b.id);
    if (!bookIds.length) return NextResponse.json({ totalOrders: 0, totalRevenue: 0, totalActiveBooks: 0, salesDetails: [] });

    let since: string | null = null;
    const now = new Date();
    if (timeFrame === "today") {
      const d = new Date(now); d.setHours(0, 0, 0, 0); since = d.toISOString();
    } else if (timeFrame === "week") {
      const d = new Date(now); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); since = d.toISOString();
    } else if (timeFrame === "month") {
      since = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (timeFrame === "year") {
      since = new Date(now.getFullYear(), 0, 1).toISOString();
    } else if (timeFrame === "untilnow") {
      since = new Date(0).toISOString();
    }

    const placeholders = bookIds.map(() => "?").join(",");
    const query = "SELECT o.product_id, p.amount_in_inr, p.original_amount, p.original_currency, p.updated_at " +
      "FROM orders o JOIN payments p ON p.order_id = o.id " +
      `WHERE o.product_id IN (${placeholders}) AND o.status = 'completed'` +
      (since ? " AND o.created_at >= ?" : "");
    const params = since ? [...bookIds, since] : bookIds;
    const orders = await db.prepare(query).bind(...params).all<Record<string, any>>();

    const salesDetails = orders.results.map((order) => {
      const book = books.results.find((b) => b.id === order.product_id);
      return {
        bookId: order.product_id,
        bookTitle: book?.title || "Unknown Book",
        amount_in_inr: Number(order.amount_in_inr || 0),
        transactedAmount: Number(order.original_amount || 0),
        transactedAmountCurrency: order.original_currency,
        saleDate: order.updated_at
      };
    });

    return NextResponse.json({
      totalOrders: salesDetails.length,
      totalRevenue: salesDetails.reduce((sum, sale) => sum + sale.amount_in_inr, 0),
      totalActiveBooks: books.results.length,
      salesDetails
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json({ error: "Failed to load sales data" }, { status: 500 });
  }
}
