import Link from "next/link";
import { getD1 } from "@/utils/cloudflare/d1";

type Props = { authorId: string; timeFrame?: "today" | "week" | "month" | "year" | "untilnow" };

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

export default async function MySales({ authorId }: Props) {
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

  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const weekStart = now - 7 * 24 * 60 * 60 * 1000;
  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);
  const monthStart = month.getTime();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();

  const periods = [
    { label: "Today", description: "Sales made today", count: sales.filter((sale) => saleTimestamp(sale) >= todayStart && saleTimestamp(sale) <= now).length, accent: "from-sky-500 to-blue-600" },
    { label: "Last 7 Days", description: "Rolling seven-day period", count: sales.filter((sale) => saleTimestamp(sale) >= weekStart && saleTimestamp(sale) <= now).length, accent: "from-violet-500 to-purple-600" },
    { label: "This Month", description: "Current calendar month", count: sales.filter((sale) => saleTimestamp(sale) >= monthStart && saleTimestamp(sale) <= now).length, accent: "from-emerald-500 to-teal-600" },
    { label: "This Year", description: "Current calendar year", count: sales.filter((sale) => saleTimestamp(sale) >= yearStart && saleTimestamp(sale) <= now).length, accent: "from-amber-500 to-orange-600" },
    { label: "All Time", description: "From your first sale until now", count: sales.length, accent: "from-rose-500 to-pink-600" },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 px-6 py-8 text-white shadow-xl sm:px-9">
        <div className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Author dashboard</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My Sales</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          A clear overview of your completed book sales, from today to all time.
        </p>
      </header>

      <section aria-labelledby="sales-overview-heading" className="space-y-4">
        <div>
          <h2 id="sales-overview-heading" className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Sales Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Number of completed sales in each period. Revenue is not calculated in this section.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {periods.map((period) => (
            <article key={period.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${period.accent}`} />
              <div className="text-sm font-semibold text-slate-500">{period.label}</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{period.count}</span>
                <span className="text-xs font-medium text-slate-500">{period.count === 1 ? "sale" : "sales"}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{period.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sales-details-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition hover:bg-slate-50 sm:px-7 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 id="sales-details-heading" className="text-lg font-bold text-slate-900 sm:text-xl">Sales Details</h2>
              <p className="mt-1 text-sm text-slate-500">Open to view each book sale, its original currency, and the exact sale date and time.</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition group-open:bg-slate-800">
              <span className="hidden sm:inline group-open:hidden">View Details</span>
              <span className="hidden sm:group-open:inline">Hide Details</span>
              <span className="sm:hidden group-open:hidden">View</span>
              <span className="hidden group-open:inline sm:hidden">Hide</span>
              <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.09 1.032l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.052z" clipRule="evenodd" />
              </svg>
            </span>
          </summary>
          <div className="border-t border-slate-200">
            {sales.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold sm:px-7">Book Name</th>
                      <th className="px-5 py-4 font-semibold">Price Sold</th>
                      <th className="px-5 py-4 font-semibold sm:px-7">Sale Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="transition hover:bg-blue-50/50">
                        <td className="px-5 py-4 font-medium text-slate-800 sm:px-7">
                          <Link className="text-blue-700 decoration-blue-300 underline-offset-4 hover:underline" href={"/book/" + sale.book_id}>{sale.title}</Link>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{formatPrice(sale.amount, sale.currency)}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 sm:px-7">
                          {new Date(sale.updated_at || sale.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7l1.5 13h11L19 7M9 11v5m6-5v5M8 7V4h8v3" />
                  </svg>
                </div>
                <p className="mt-3 font-semibold text-slate-800">No completed sales yet</p>
                <p className="mt-1 text-sm text-slate-500">Your completed book sales will appear here.</p>
              </div>
            )}
          </div>
        </details>
      </section>
    </main>
  );
}
