"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window { Razorpay?: new (options: Record<string, any>) => { open: () => void; on: (event: string, callback: (response: any) => void) => void }; }
}
const plans = [
  { id: "1-month", name: "1 Month", duration: "1 month", amount: 299 },
  { id: "3-months", name: "3 Months", duration: "3 months", amount: 850 },
  { id: "6-months", name: "6 Months", duration: "6 months", amount: 1550 },
  { id: "12-months", name: "12 Months", duration: "12 months", amount: 3000, featured: true },
];
function formatDate(value: string) { return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }); }

export default function SubscriptionPlanSelector({ signedIn }: { signedIn: boolean }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{planName:string;amount:number;startedAt:string;expiresAt:string}|null>(null);
  useEffect(() => {
    if (document.querySelector('script[data-razorpay-checkout="true"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    document.body.appendChild(script);
  }, []);

  const subscribe = async (planId: string) => {
    setError("");
    if (!signedIn) { window.location.href = "/login?next=%2Fsubscribe-now"; return; }
    if (!window.Razorpay) { setError("The secure payment window is loading. Please wait a moment and try again."); return; }
    setLoading(planId);
    try {
      const response = await fetch("/api/subscription/create-order", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start payment.");
      const checkout = new window.Razorpay({
        key: data.keyId, amount: data.amount, currency: data.currency, name: data.name, description: data.description,
        order_id: data.orderId, prefill: data.prefill, theme: { color: "#1d4ed8" },
        modal: { ondismiss: () => setLoading("") },
        handler: async (result: any) => {
          try {
            const verified = await fetch("/api/subscription/verify-payment", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result) });
            const resultData = await verified.json();
            if (!verified.ok || !resultData.success) throw new Error(resultData.error || "Payment is not confirmed yet.");
            setConfirmation({ planName: resultData.planName, amount: resultData.amount, startedAt: resultData.startedAt, expiresAt: resultData.expiresAt });
            setLoading("");
          } catch (e) { setError(e instanceof Error ? e.message : "We could not verify the payment. If money was deducted, please contact support before paying again."); setLoading(""); }
        },
      });
      checkout.on("payment.failed", (event: any) => { setError(event?.error?.description || "Payment was not completed. Please try again."); setLoading(""); });
      checkout.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start payment. Please try again.");
      setLoading("");
    }
  };

  if (confirmation) return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="subscription-success-title">
    <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 px-6 py-8 text-center text-white"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl">🎉</div><h2 id="subscription-success-title" className="mt-4 text-2xl font-black sm:text-3xl">Welcome to the Shoppers Ocean family!</h2><p className="mt-2 text-sm text-cyan-50">Your subscription has been activated successfully.</p></div>
      <div className="p-6 sm:p-8"><div className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><p className="flex justify-between gap-4 py-1 text-sm"><strong>Plan</strong><span>{confirmation.planName}</span></p><p className="flex justify-between gap-4 py-1 text-sm"><strong>Amount paid</strong><span>₹{confirmation.amount.toLocaleString("en-IN")}</span></p><p className="flex justify-between gap-4 py-1 text-sm"><strong>Activation date</strong><span className="text-right">{formatDate(confirmation.startedAt)}</span></p><p className="flex justify-between gap-4 py-1 text-sm"><strong>Expiry date</strong><span className="text-right">{formatDate(confirmation.expiresAt)}</span></p><p className="flex justify-between gap-4 py-1 text-sm"><strong>Status</strong><span className="font-extrabold text-green-700">Active</span></p></div><p className="mt-4 text-sm leading-6 text-slate-600">Thank you for subscribing. Your included entertainment features are ready to explore. A confirmation email with your plan details will also be sent to your registered email address. E-books and flipbooks remain separate.</p><Link href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-extrabold text-white hover:bg-blue-800">Start Exploring →</Link></div>
    </div>
  </div>;

  return <div id="subscription-plans" className="mt-10">
    <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Choose Your Subscription Plan</h2>
    <p className="mt-2 text-sm text-slate-500">Secure checkout. Your membership activates after the payment is verified.</p>
    {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-left text-sm font-semibold text-rose-800">{error}</div>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map(plan => <div key={plan.id} className={`relative flex flex-col rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.featured ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white ring-2 ring-blue-200" : "border-slate-200 bg-white"}`}>
        {plan.featured && <span className="mb-3 self-start rounded-full bg-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Best Value</span>}
        <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3><p className="mt-1 text-xs text-slate-500">{plan.duration}</p>
        <p className="mt-4 text-3xl font-black tracking-tight text-blue-800">₹{plan.amount.toLocaleString("en-IN")}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Access to subscription-covered entertainment features while your plan is active.</p>
        <button disabled={Boolean(loading)} onClick={() => void subscribe(plan.id)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-extrabold text-white shadow transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{loading === plan.id ? "Preparing secure checkout…" : loading ? "Please wait…" : "Subscribe Now →"}</button>
      </div>)}
    </div>
  </div>;
}
