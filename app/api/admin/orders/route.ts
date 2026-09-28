import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
  const page = Math.max(0, Number(url.searchParams.get("page") || 0));
  const limit = 100;
  const offset = page * limit;

  const where: string[] = ["COALESCE(o.status, '') <> 'deleted'"];
  const params: unknown[] = [];
  if (status && status !== "all") { where.push("o.status = ?"); params.push(status); }
  if (date === "today") where.push("o.order_date >= date('now')");
  if (date === "month") where.push("o.order_date >= date('now','start of month')");
  if (date === "year") where.push("o.order_date >= date('now','start of year')");
  if (search) {
    where.push("(lower(COALESCE(b.title,'')) LIKE ? OR lower(COALESCE(o.email,'')) LIKE ? OR lower(COALESCE(o.razorpay_order_id,'')) LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  const clause = where.join(" AND ");

  const count = await db.prepare(`SELECT COUNT(*) AS count FROM orders o LEFT JOIN books b ON b.id=o.product_id WHERE ${clause}`).bind(...params).first<{count:number}>();
  const rows = await db.prepare(
    `SELECT o.id,o.order_date,o.product_id,o.email,o.contact_number,o.status,o.razorpay_order_id,
            b.title AS book_title,b.author_name,
            p.amount_in_inr,p.payment_method,p.bank,p.card_network
     FROM orders o
     LEFT JOIN books b ON b.id=o.product_id
     LEFT JOIN payments p ON p.order_id=o.id
     WHERE ${clause}
     ORDER BY o.order_date DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all<Record<string, any>>();

  const totals = await db.prepare(
    `SELECT COUNT(*) AS totalOrders,
            COALESCE(SUM(CASE WHEN status='completed' THEN total_amount ELSE 0 END),0) AS totalRevenue,
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS successfulOrders,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pendingOrders
     FROM orders o WHERE ${clause.replace(/lower\(COALESCE\(b\.title,''\)\) LIKE \? OR lower\(COALESCE\(o\.email,''\)\) LIKE \? OR lower\(COALESCE\(o\.razorpay_order_id,''\)\) LIKE \?/,"1=1")}`
  ).bind(...(search ? params.slice(0, -3) : params)).first<Record<string, any>>();

  return NextResponse.json({
    purchases: rows.results,
    totalCount: Number(count?.count || 0),
    stats: {
      totalOrders: Number(totals?.totalOrders || 0),
      totalRevenue: Number(totals?.totalRevenue || 0),
      successfulOrders: Number(totals?.successfulOrders || 0),
      pendingOrders: Number(totals?.pendingOrders || 0)
    }
  }, { headers: { "Cache-Control": "no-store" } });
}
