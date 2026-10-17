"use client";
import { useEffect, useState } from "react";
export default function CashfreeReturnPage() {
  const [message, setMessage] = useState("Verifying your payment securely…");
  useEffect(() => {
    let active = true;
    const orderId = new URLSearchParams(window.location.search).get("order_id") || "";
    if (!orderId) { setMessage("The payment reference is missing. Please return to the book page and check your purchase history."); return; }
    (async () => {
      try {
        const response = await fetch("/api/cashfree", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify({ action: "verify", orderId }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.status !== "completed" || !data.productId) throw new Error(data.error || "Payment has not yet been confirmed.");
        if (active) { setMessage("Payment confirmed. Opening your book…"); window.location.replace("/book/" + encodeURIComponent(String(data.productId))); }
      } catch (e) { if (active) setMessage(e instanceof Error ? e.message : "We could not verify the payment yet. Please contact support before paying again."); }
    })();
    return () => { active = false; };
  }, []);
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center"><h1 className="text-2xl font-extrabold text-slate-900">Cashfree payment</h1><p className="mt-4 text-slate-700" role="status">{message}</p><a href="/books" className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Return to books</a></main>;
}
