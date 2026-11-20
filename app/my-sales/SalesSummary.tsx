"use client";

import { useState } from "react";

type Period = "today" | "yesterday" | "last7Days" | "thisMonth";
type GatewayTotals = { total: number; razorpay: number; paypal: number; count: number; pendingConversion: number };
type Props = Record<Period, GatewayTotals>;

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SalesSummary(props: Props) {
  const [period, setPeriod] = useState<Period>("today");
  const totals = props[period];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <label htmlFor="sales-period" className="text-sm font-semibold text-slate-700">Sales Period</label>
        <select
          id="sales-period"
          value={period}
          onChange={(event) => setPeriod(event.target.value as Period)}
          className="min-h-10 min-w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7Days">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Sales Volume</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{money(totals.total)}</p>
        <p className="mt-1 text-xs text-slate-500">{totals.count} completed {totals.count === 1 ? "sale" : "sales"}{totals.pendingConversion ? ` · ${totals.pendingConversion} awaiting PayPal settlement conversion` : ""}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <span>Razorpay: <strong className="text-slate-800">{money(totals.razorpay)}</strong></span>
          <span>PayPal: <strong className="text-slate-800">{money(totals.paypal)}</strong></span>
        </div>
      </div>
    </section>
  );
}
