import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json(
        { error: "Cloudflare D1 is not available" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = await db.prepare(
      `SELECT
        o.id,
        o.order_date,
        o.total_amount AS original_amount,
        o.currency AS original_currency,
        o.status,
        b.id AS book_id,
        b.title AS book_title,
        p.original_amount AS payment_original_amount,
        p.original_currency AS payment_original_currency,
        p.payment_method
      FROM orders o
      LEFT JOIN books b ON b.id = o.product_id
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC`
    ).bind(user.id).all<any>();

    const purchases = (result.results || []).map((row: any) => ({
      id: String(row.id),
      order_date: row.order_date,
      original_amount: row.original_amount,
      status: row.status,
      books: row.book_id
        ? { id: String(row.book_id), title: row.book_title || null }
        : null,
      payment: {
        original_amount: row.payment_original_amount ?? row.original_amount ?? 0,
        original_currency: row.payment_original_currency ?? row.original_currency ?? "",
        payment_method: row.payment_method ?? "N/A",
      },
    }));

    return NextResponse.json(purchases, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("My purchases error:", error);
    return NextResponse.json(
      { error: "Failed to load purchases" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
