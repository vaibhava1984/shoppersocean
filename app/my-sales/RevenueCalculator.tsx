"use client";

import { useMemo, useState } from "react";
type PeriodTotal = { period: string; revenue: number | null };
type Props = { monthly: PeriodTotal[]; yearly: PeriodTotal[] };

function formatRevenue(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function RevenueCalculator({ monthly, yearly }: Props) {
  const now = new Date();
  const currentMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(now);
  const currentYear = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kolkata", year: "numeric" }).format(now);
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const totals = view === "monthly" ? monthly : yearly;
  const selectedPeriod = view === "monthly" ? selectedMonth : selectedYear;
  const options = useMemo(() => { const values = new Set(totals.map((item) => item.period)); values.add(selectedPeriod); return Array.from(values).sort((a, b) => b.localeCompare(a)); }, [totals, selectedPeriod]);
  const selectedTotal = totals.find((item) => item.period === selectedPeriod);
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-slate-900">Revenue Calculator</h2>
        <p className="mt-1 text-sm text-slate-500">Your net revenue after applicable payment gateway charges.</p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <button type="button" aria-pressed={view === "monthly"} onClick={() => setView("monthly")} className={view === "monthly" ? "min-h-11 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm" : "min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white"}>Monthly Revenue</button>
          <button type="button" aria-pressed={view === "yearly"} onClick={() => setView("yearly")} className={view === "yearly" ? "min-h-11 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm" : "min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white"}>Yearly Revenue</button>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          {view === "monthly" ? "Select month" : "Select year"}
          <select value={selectedPeriod} onChange={(event) => view === "monthly" ? setSelectedMonth(event.target.value) : setSelectedYear(event.target.value)} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
            {options.map((period) => <option key={period} value={period}>{view === "monthly" ? new Date(period + "-01T12:00:00Z").toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }) : period}</option>)}
          </select>
        </label>
        <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-600">{view === "monthly" ? "Monthly Revenue" : "Yearly Revenue"}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{selectedTotal?.revenue === null ? "Pending" : formatRevenue(selectedTotal?.revenue ?? 0)}</p>
          {selectedTotal?.revenue === null && <p className="mt-2 text-xs text-slate-500">Revenue will appear once the payment gateway confirms its fee.</p>}
        </div>
      </div>
    </section>
  );
}
