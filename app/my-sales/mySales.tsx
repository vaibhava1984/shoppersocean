import Link from "next/link";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureRevenueSchema } from "@/utils/revenue";
import RevenueCalculator from "./RevenueCalculator";

type Props = { authorId: string | null; isAdmin: boolean; fromDate?: string; toDate?: string };

function saleTimestamp(sale: any) {
  const value = sale.updated_at || sale.created_at;
  const timestamp = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatPrice(amount: unknown, currency: unknown) {
  const value = Number(amount ?? 0);
  const code = String(currency || "").trim().toUpperCase();
  if (!Number.isFinite(value)) return "—";
  if (!code) return value.toFixed(2);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

export default async function MySales({ authorId, isAdmin, fromDate = "", toDate = "" }: Props) {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");
  await ensureRevenueSchema(db);

  const books = authorId ? ((await db
    .prepare("SELECT id,title FROM books WHERE author_id=? AND COALESCE(is_deleted,0)=0 ORDER BY title ASC")
    .bind(authorId)
    .all<{ id: string; title: string }>()).results || []) : [];

  const ids = books.map((book) => book.id);
  let sales: any[] = [];

  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const sql =
      "SELECT o.id,o.book_id,o.created_at,o.status,b.title,p.amount,p.currency,p.updated_at " +
      "FROM orders o JOIN books b ON b.id=o.book_id " +
      "LEFT JOIN payments p ON p.order_id=o.id " +
      "WHERE o.book_id IN (" + placeholders + ") AND o.status='completed' " +
      "ORDER BY COALESCE(p.updated_at,o.created_at) DESC";
    sales = (await db.prepare(sql).bind(...ids).all<any>()).results || [];
  }

  // Revenue is based on completed sales and confirmed gateway fees only.
  const revenueRows = ids.length ? ((await db.prepare(
    "SELECT p.id AS payment_id, p.amount, p.gateway_fee_inr, p.gateway_fee_checked_at, p.razorpay_payment_id, p.created_at, p.updated_at, o.created_at AS order_created_at " +
    "FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.book_id IN (" + ids.map(() => "?").join(",") + ") AND p.status='completed' AND o.status='completed' ORDER BY COALESCE(p.updated_at,p.created_at,o.created_at) DESC"
  ).bind(...ids).all<any>()).results || []) : [];

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret) {
    const staleBefore = Date.now() - 24 * 60 * 60 * 1000;
    for (const row of revenueRows) {
      const checked = row.gateway_fee_checked_at ? new Date(row.gateway_fee_checked_at).getTime() : 0;
      if (row.gateway_fee_inr != null || !row.razorpay_payment_id || (checked && checked > staleBefore)) continue;
      try {
        const response = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(String(row.razorpay_payment_id)), { headers: { Authorization: "Basic " + btoa(keyId + ":" + keySecret) }, cache: "no-store" });
        const payment = await response.json() as Record<string, any>;
        const checkedAt = new Date().toISOString();
        if (response.ok && payment?.id === row.razorpay_payment_id && payment.fee != null && Number.isFinite(Number(payment.fee))) {
          const feeInr = (Number(payment.fee) + Number(payment.tax || 0)) / 100;
          await db.prepare("UPDATE payments SET gateway_fee_inr=?, gateway_name='Razorpay', gateway_fee_checked_at=? WHERE id=?").bind(feeInr, checkedAt, row.payment_id).run();
          row.gateway_fee_inr = feeInr;
        } else {
          await db.prepare("UPDATE payments SET gateway_fee_checked_at=? WHERE id=?").bind(checkedAt, row.payment_id).run();
        }
        row.gateway_fee_checked_at = checkedAt;
      } catch (error) { console.error("Could not reconcile gateway fee", row.payment_id, error); }
    }
  }

  const monthlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const yearlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const authorMonthlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const authorYearlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const getPeriods = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value || String(date.getUTCFullYear());
    const month = parts.find((part) => part.type === "month")?.value || String(date.getUTCMonth() + 1).padStart(2, "0");
    return { month: year + "-" + month, year };
  };
  for (const row of revenueRows) {
    const date = new Date(row.updated_at || row.created_at || row.order_created_at || "");
    if (!Number.isFinite(date.getTime())) continue;
    const period = getPeriods(date);
    const gross = Number(row.amount);
    const fee = row.gateway_fee_inr == null ? NaN : Number(row.gateway_fee_inr);
    const valid = Number.isFinite(gross) && gross >= 0 && Number.isFinite(fee) && fee >= 0;
    const net = valid ? Math.max(0, gross - fee) : 0;
    const earned = net * (isAdmin ? 1 : 0.75);
    for (const [map, key, amount] of [
      [monthlyMap, period.month, earned],
      [yearlyMap, period.year, earned],
      [authorMonthlyMap, period.month, net * 0.75],
      [authorYearlyMap, period.year, net * 0.75],
    ] as const) {
      const total = map.get(key) || { revenue: 0, complete: true };
      if (valid) total.revenue += amount; else total.complete = false;
      map.set(key, total);
    }
  }
  // Show every month from January through the current month, even with no sales.
  const periodNow = new Date();
  const currentParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(periodNow);
  const currentYear = Number(currentParts.find((part) => part.type === "year")?.value || periodNow.getUTCFullYear());
  const currentMonth = Number(currentParts.find((part) => part.type === "month")?.value || periodNow.getUTCMonth() + 1);
  for (let month = 1; month <= currentMonth; month++) {
    const period = `${currentYear}-${String(month).padStart(2, "0")}`;
    if (!monthlyMap.has(period)) monthlyMap.set(period, { revenue: 0, complete: true });
    if (!authorMonthlyMap.has(period)) authorMonthlyMap.set(period, { revenue: 0, complete: true });
  }
  // Always offer 2025 and the current year, plus any earlier years with recorded sales.
  for (let year = Math.min(2025, currentYear); year <= currentYear; year++) {
    const period = String(year);
    if (!yearlyMap.has(period)) yearlyMap.set(period, { revenue: 0, complete: true });
    if (!authorYearlyMap.has(period)) authorYearlyMap.set(period, { revenue: 0, complete: true });
  }
  const monthlyRevenue = Array.from(monthlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));
  const yearlyRevenue = Array.from(yearlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));
  const authorMonthlyRevenue = Array.from(authorMonthlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));
  const authorYearlyRevenue = Array.from(authorYearlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayCount = sales.filter((sale) => {
    const ts = saleTimestamp(sale);
    if (!ts) return false;
    const date = new Date(ts);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return key === todayKey;
  }).length;

  const hasRange = Boolean(fromDate && toDate && fromDate <= toDate);
  const filteredSales = hasRange
    ? sales.filter((sale) => {
        const ts = saleTimestamp(sale);
        if (!ts) return false;
        const date = new Date(ts);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return key >= fromDate && key <= toDate;
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6">
      <section className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Sales Today</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{todayCount}</p>
          <p className="text-xs text-slate-500">{todayCount === 1 ? "completed sale" : "completed sales"}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700" aria-hidden="true">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v15H4zM8 3v4m8-4v4M4 9h16M8 13h3m-3 3h6" />
          </svg>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Filter Sales by Date</h2>
        <form method="get" action="/my-sales" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-sm font-medium text-slate-700">
            From date
            <input required type="date" name="fromDate" defaultValue={fromDate} max={toDate || undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            To date
            <input required type="date" name="toDate" defaultValue={toDate} min={fromDate || undefined} max={todayKey} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Show Sales</button>
        </form>
      </section>

      {hasRange ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-semibold text-slate-900">Sales Results</h2>
              <p className="text-xs text-slate-500">{fromDate} to {toDate} · {filteredSales.length} {filteredSales.length === 1 ? "sale" : "sales"}</p>
            </div>
            <Link href="/my-sales" className="text-sm font-medium text-blue-700 hover:underline">Clear filter</Link>
          </div>
          {filteredSales.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5">Book Name</th>
                    <th className="px-4 py-3 font-semibold">Sale Price</th>
                    <th className="px-4 py-3 font-semibold sm:px-5">Sale Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-50/40">
                      <td className="px-4 py-3 font-medium text-slate-800 sm:px-5">
                        <Link className="text-blue-700 underline-offset-4 hover:underline" href={"/book/" + sale.book_id}>{sale.title}</Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{formatPrice(sale.amount, sale.currency)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">{new Date(sale.updated_at || sale.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No completed sales found for these dates.</p>
          )}
        </section>
      ) : (
        <p className="px-1 text-xs text-slate-500">Choose a from date and to date to view sales for that period.</p>
      )}
      <RevenueCalculator monthly={monthlyRevenue} yearly={yearlyRevenue} authorMonthly={authorMonthlyRevenue} authorYearly={authorYearlyRevenue} isAdmin={isAdmin} />
    </main>
  );
}
