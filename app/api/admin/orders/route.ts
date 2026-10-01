import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

function sinceFor(filter: string) {
  const now = new Date();
  if (filter === "today") {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString();
  }
  if (filter === "month") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  if (filter === "year") return new Date(now.getFullYear(), 0, 1).toISOString();
  return null;
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const url = new URL(req.url);
    const dateFilter = url.searchParams.get("dateFilter") || "all";
    const statusFilter = url.searchParams.get("statusFilter") || "all";
    const search = (url.searchParams.get("search") || "").trim();
    const page = Math.max(0, Number(url.searchParams.get("page") || 0));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 100)));
    const since = sinceFor(dateFilter);

    const conditions: string[] = [];
    const binds: unknown[] = [];
    if (statusFilter !== "all") { conditions.push("o.status = ?"); binds.push(statusFilter); }
    if (since) { conditions.push("o.order_date >= ?"); binds.push(since); }
    if (search) {
      conditions.push("(LOWER(COALESCE(b.title,'')) LIKE ? OR LOWER(COALESCE(o.email,'')) LIKE ? OR LOWER(COALESCE(o.razorpay_order_id,'')) LIKE ?)");
      const q = "%" + search.toLowerCase() + "%";
      binds.push(q, q, q);
    }
    const where = conditions.join(" AND ");

    const count = await db.prepare(
      "SELECT COUNT(*) AS count FROM orders o LEFT JOIN books b ON b.id=o.product_id WHERE " + where
    ).bind(...binds).first<{ count: number }>();

    const rows = await db.prepare(
      "SELECT o.*, p.full_name, p.email AS profile_email, b.id AS book_id, b.title AS book_title, " +
      "b.author_name AS book_author, pay.amount_in_inr, pay.payment_method, pay.bank, pay.card_network " +
      "FROM orders o LEFT JOIN profiles p ON p.id=o.user_id LEFT JOIN books b ON b.id=o.product_id " +
      "LEFT JOIN payments pay ON pay.order_id=o.id WHERE " + where +
      " ORDER BY o.order_date DESC LIMIT ? OFFSET ?"
    ).bind(...binds, limit, page * limit).all<Record<string, any>>();

    const statsConditions = since ? " WHERE order_date >= ?" : "";
    const statsBinds = since ? [since] : [];
    const stats = await db.prepare(
      "SELECT COUNT(*) AS totalOrders, " +
      "COALESCE(SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END),0) AS successfulOrders, " +
      "COALESCE(SUM(CASE WHEN status IN ('pending','authorized') THEN 1 ELSE 0 END),0) AS pendingOrders " +
      "FROM orders" + statsConditions
    ).bind(...statsBinds).first<Record<string, number>>();
    const revenue = await db.prepare(
      "SELECT COALESCE(SUM(p.amount_in_inr),0) AS totalRevenue FROM orders o JOIN payments p ON p.order_id=o.id " +
      "WHERE o.status='completed'" + (since ? " AND o.order_date >= ?" : "")
    ).bind(...statsBinds).first<{ totalRevenue: number }>();

    const purchases = rows.results.map((row) => ({
      ...row,
      profiles: { id: row.user_id, full_name: row.full_name, email: row.profile_email || row.email },
      product: row.book_id ? { id: row.book_id, title: row.book_title, author: row.book_author } : null,
      payment: {
        amount_in_inr: row.amount_in_inr,
        payment_method: row.payment_method,
        bank: row.bank,
        card_network: row.card_network
      }
    }));

    return NextResponse.json({
      purchases,
      totalCount: Number(count?.count || 0),
      stats: {
        totalOrders: Number(stats?.totalOrders || 0),
        totalRevenue: Number(revenue?.totalRevenue || 0),
        successfulOrders: Number(stats?.successfulOrders || 0),
        pendingOrders: Number(stats?.pendingOrders || 0)
      }
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error loading admin orders:", error);
    return NextResponse.json({ error: "Error loading orders" }, { status: 500 });
  }
}
