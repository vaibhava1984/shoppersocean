import Link from "next/link";
import { getD1 } from "@/utils/cloudflare/d1";

type Props = { authorId: string; fromDate?: string; toDate?: string };

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

export default async function MySales({ authorId, fromDate = "", toDate = "" }: Props) {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");

  const books = (await db
    .prepare("SELECT id,title FROM books WHERE author_id=? AND COALESCE(is_deleted,0)=0 ORDER BY title ASC")
    .bind(authorId)
    .all<{ id: string; title: string }>()).results || [];

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
    </main>
  );
}
