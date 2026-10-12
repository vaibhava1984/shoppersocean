"use client";

import { useState } from "react";

export default function RecoverCapturedPaymentPage() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function recover() {
    setBusy(true);
    setResult("Checking Razorpay and restoring the purchase securely…");
    try {
      const response = await fetch("/api/admin/recover-captured-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setResult("Not restored: " + (data.error || data.message || "The server rejected the request.") + " No payment should be made again.");
      } else {
        setResult("Recovery result: " + JSON.stringify(data));
      }
    } catch {
      setResult("The request could not reach the server. The purchase has NOT been confirmed restored. Do not pay again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-3 text-2xl font-semibold">Recover captured payment</h1>
      <p className="mb-5">This one-time action checks the ₹100 Razorpay payment for the Bengali book and restores access only if Razorpay confirms the payment and all customer/book details match.</p>
      <button type="button" onClick={recover} disabled={busy} className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white disabled:opacity-60">
        {busy ? "Verifying payment…" : "Verify and restore purchase"}
      </button>
      {result ? <p role="status" className="mt-5 break-words rounded border p-4">{result}</p> : null}
    </main>
  );
}
