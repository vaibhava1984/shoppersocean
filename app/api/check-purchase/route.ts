import { NextResponse } from "next/server";
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const { productId, productIds } = await req.json();
    const ids = productId ? [productId] : Array.isArray(productIds) ? productIds : [];
    if (!ids.length) return NextResponse.json({ error: "Product ID or Product IDs are required" }, { status: 400, headers: { "Cache-Control": "no-store" } });

    const placeholders = ids.map(() => "?").join(",");
    const rows = await db.prepare(
      `SELECT id, book_id, created_at, status FROM orders WHERE user_id = ? AND status = 'completed' AND book_id IN (${placeholders}) ORDER BY created_at DESC`
    ).bind(identity.profile.id, ...ids).all<Record<string, any>>();

    if (productId) {
      const orders = rows.results.filter((o) => o.book_id === productId);
      return NextResponse.json({
        hasPurchased: orders.length > 0,
        orderDetails: orders.map((o) => ({ order_id: o.id, purchase_date: o.created_at, status: o.status }))
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const result: Record<string, any> = {};
    ids.forEach((id) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
    rows.results.forEach((order) => {
      if (result[order.book_id]) {
        result[order.book_id].hasPurchased = true;
        result[order.book_id].orderDetails.push({ order_id: order.id, purchase_date: order.created_at, status: order.status });
      }
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error checking purchase:", error);
    return NextResponse.json({ error: "Error checking purchase" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
