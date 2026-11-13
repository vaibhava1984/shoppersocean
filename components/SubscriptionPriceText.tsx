"use client";

import { useEffect, useState } from "react";

type Pricing = {
  currency: "INR" | "USD";
  plans: Array<{ id: string; amount: number }>;
};

export default function SubscriptionPriceText() {
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/subscription/create-order", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to load pricing");
        return response.json();
      })
      .then(data => {
        if (!active || (data.currency !== "INR" && data.currency !== "USD") || !Array.isArray(data.plans)) return;
        setPricing({
          currency: data.currency,
          plans: data.plans.map((plan: { id: string; amount: number }) => ({
            id: plan.id,
            amount: Number(plan.amount),
          })),
        });
      })
      .catch(() => {
        if (active) setPricing(null);
      });
    return () => { active = false; };
  }, []);

  if (!pricing) {
    return (
      <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:text-base" aria-live="polite">
        Subscription prices are shown in your local applicable currency in the plans below.
      </p>
    );
  }

  const symbol = pricing.currency === "USD" ? "$" : "₹";
  const format = (amount: number) => pricing.currency === "USD"
    ? amount.toFixed(2)
    : amount.toLocaleString("en-IN");

  const amountFor = (id: string) => {
    const plan = pricing.plans.find(item => item.id === id);
    return plan ? `${symbol}${format(plan.amount)}` : "—";
  };

  return (
    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5">
      <p className="text-sm font-bold leading-6 text-blue-950 sm:text-base">
        Subscription plans and prices:
      </p>
      <p className="mt-1 text-sm leading-7 text-slate-700 sm:text-base">
        1 Month: <strong className="text-blue-900">{amountFor("1-month")}</strong>
        <span className="mx-2 text-blue-300">|</span>
        6 Months: <strong className="text-blue-900">{amountFor("6-months")}</strong>
        <span className="mx-2 text-blue-300">|</span>
        1 Year: <strong className="text-blue-900">{amountFor("12-months")}</strong>
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Prices are displayed in {pricing.currency === "INR" ? "Indian rupees" : "US dollars"} according to your location.
      </p>
    </div>
  );
}
