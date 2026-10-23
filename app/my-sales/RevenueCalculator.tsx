"use client";

import { useMemo, useState } from "react";

type PeriodTotal = { period: string; revenue: number | null };
type Props = { monthly: PeriodTotal[]; yearly: PeriodTotal[]; authorMonthly?: PeriodTotal[]; authorYearly?: PeriodTotal[]; isAdmin?: boolean };

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function RevenueCalculator({ monthly, yearly, authorMonthly, authorYearly, isAdmin = false }: Props) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const currentYear = parts.find((part) => part.type === "year")?.value || String(now.getFullYear());
  const currentMonth = parts.find((part) => part.type === "month")?.value || String(now.getMonth() + 1).padStart(2, "0");
  const currentMonthKey = `${currentYear}-${currentMonth}`;

  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [authorPreview, setAuthorPreview] = useState(false);

  const monthOptions = useMemo(() => {
    const values = new Set(monthly.map((item) => item.period));
    values.add(currentMonthKey);
    return Array.from(values).sort((a, b) => b.localeCompare(a));
  }, [monthly, currentMonthKey]);

  const yearOptions = useMemo(() => {
    const values = new Set(yearly.map((item) => item.period));
    values.add("2025");
    values.add(currentYear);
    return Array.from(values).sort((a, b) => b.localeCompare(a));
  }, [yearly, currentYear]);

  const selectedPeriod = view === "monthly" ? selectedMonth : selectedYear;
  const options = view === "monthly" ? monthOptions : yearOptions;
  const regularMonthly = authorMonthly || monthly;
  const regularYearly = authorYearly || yearly;
  const totals = authorPreview && isAdmin
    ? (view === "monthly" ? regularMonthly : regularYearly)
    : (view === "monthly" ? monthly : yearly);
  const selectedTotal = totals.find((item) => item.period === selectedPeriod);
  const isPending = selectedTotal?.revenue === null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h17M8 15v-4m4 4V7m4 8v-6m4 6V4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Revenue Calculator</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">View your net earnings by month or year, after confirmed payment gateway charges.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:gap-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)] lg:items-end">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Revenue period</p>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button type="button" aria-pressed={view === "monthly"} onClick={() => setView("monthly")} className={view === "monthly" ? "min-h-11 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-slate-200" : "min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"}>Monthly Revenue</button>
              <button type="button" aria-pressed={view === "yearly"} onClick={() => setView("yearly")} className={view === "yearly" ? "min-h-11 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-slate-200" : "min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"}>Yearly Revenue</button>
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            {view === "monthly" ? "Choose month" : "Choose year"}
            <span className="relative mt-2 block">
              <select value={selectedPeriod} onChange={(event) => view === "monthly" ? setSelectedMonth(event.target.value) : setSelectedYear(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-base font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
                {options.map((period) => <option key={period} value={period}>{view === "monthly" ? monthLabel(period) : period}</option>)}
              </select>
              <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.09 1.032l-4.255 4.516a.75.75 0 01-1.09 0L5.21 8.26a.75.75 0 01.02-1.05z" clipRule="evenodd" /></svg>
            </span>
          </label>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-5 py-6 text-white sm:px-6 sm:py-7">
          <div aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-white/5" />
          <div aria-hidden="true" className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative">
            {isAdmin && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Calculation view</p>
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/15 bg-white/5 p-1">
                  <button type="button" aria-pressed={!authorPreview} onClick={() => setAuthorPreview(false)} className={!authorPreview ? "min-h-10 rounded-lg bg-white px-2 py-2 text-xs font-bold text-slate-900 shadow-sm" : "min-h-10 rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 transition hover:text-white"}>Admin Earnings</button>
                  <button type="button" aria-pressed={authorPreview} onClick={() => setAuthorPreview(true)} className={authorPreview ? "min-h-10 rounded-lg bg-white px-2 py-2 text-xs font-bold text-slate-900 shadow-sm" : "min-h-10 rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 transition hover:text-white"}>Author Share Preview</button>
                </div>
                {authorPreview && <p className="mt-2 text-xs leading-5 text-amber-200">Preview only — actual earnings, sales records, and payouts are unchanged.</p>}
              </div>
            )}
            <p className="text-sm font-medium text-slate-300">{view === "monthly" ? monthLabel(selectedPeriod) : `Year ${selectedPeriod}`} · Net revenue</p>
            <p className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">{isPending ? "Pending" : formatRevenue(selectedTotal?.revenue ?? 0)}</p>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {isPending ? "Waiting for payment fee confirmation" : "Net earnings for selected period"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
