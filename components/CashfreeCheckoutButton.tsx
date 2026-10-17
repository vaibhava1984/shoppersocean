"use client";
import { useState } from "react";
declare global {
  interface Window {
    Cashfree?: (options: { mode: "production" | "sandbox" }) => { checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<any> };
  }
}
function loadCashfree(): Promise<void> {
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-shoppers-ocean-cashfree="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Cashfree checkout failed to load")), { once: true });
      if (window.Cashfree) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.shoppersOceanCashfree = "true";
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error("Cashfree checkout failed to load")); };
    document.head.appendChild(script);
  });
}
export default function CashfreeCheckoutButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/cashfree", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify({ action: "create", productId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.paymentSessionId) throw new Error(data.error || "Unable to start card checkout.");
      await loadCashfree();
      if (!window.Cashfree) throw new Error("Cashfree checkout failed to initialize.");
      const cashfree = window.Cashfree({ mode: data.mode === "sandbox" ? "sandbox" : "production" });
      const result = await cashfree.checkout({ paymentSessionId: String(data.paymentSessionId), redirectTarget: "_self" });
      if (result?.error) throw new Error(result.error.message || "Cashfree checkout could not continue.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cashfree checkout is temporarily unavailable.");
      setBusy(false);
    }
  }
  return <div className="w-full">
    <button type="button" onClick={start} disabled={busy} className="min-h-12 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Opening secure checkout…" : "Cards & supported wallets — Cashfree"}</button>
    <p className="mt-2 text-center text-xs text-slate-500">Apple Pay or Google Pay appears only if enabled for the merchant and supported on the customer’s device and in their country.</p>
    {error ? <p role="alert" className="mt-2 text-center text-sm text-red-700">{error}</p> : null}
  </div>;
}
