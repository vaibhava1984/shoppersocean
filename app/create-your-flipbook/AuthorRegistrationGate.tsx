"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Status = {
  status: string;
  paymentDeadline: string | null;
  amount?: number;
  currency?: string;
};

function formatRemaining(deadline: string | null) {
  if (!deadline) return "";
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Payment period expired";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `Time remaining: ${hours}h ${minutes}m`;
}

export default function AuthorRegistrationGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState("");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/author-application/payment", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) return null;
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to read registration status.");
        return data;
      })
      .then((data) => { if (active) setStatus(data); })
      .catch((e) => { if (active) setMessage(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!status?.paymentDeadline || status.status !== "approved_payment_pending") return;
    const tick = () => setRemaining(formatRemaining(status.paymentDeadline));
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, [status]);

  async function pay() {
    setPaying(true);
    setMessage("");
    try {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (!existing) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const response = await fetch("/api/author-application/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Unable to create payment order.");

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error("Razorpay could not be loaded.");

      new Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency,
        name: "Shoppers Ocean",
        description: "Author registration fee",
        order_id: order.orderId,
        handler: async (paymentResponse: any) => {
          const verify = await fetch("/api/author-application/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify",
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });
          const result = await verify.json();
          if (!verify.ok || result.status !== "completed") throw new Error(result.error || "Payment could not be verified.");
          setStatus({ status: "completed", paymentDeadline: null });
          setMessage("Congratulations 🎉 Your author registration is complete.");
        },
        theme: { color: "#16a34a" },
      }).open();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to process payment.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="py-12 text-center text-slate-600">Checking your author registration status...</div>;

  if (status?.status === "rejected") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-10">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mb-8 inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-base"
        >
          <span aria-hidden="true" className="text-2xl leading-none">←</span>
          <span>Back</span>
        </button>
        <div className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed">
          <p className="mb-5">We sincerely regret to inform you that, after carefully reviewing your application, we are unable to approve your registration as an author with Shoppers Ocean at this time.</p>
          <p className="mb-5">However, we would be delighted to have you continue as one of our esteemed users, and we truly appreciate your interest in being a part of Shoppers Ocean.</p>
          <p>Thank you for your understanding and for considering Shoppers Ocean.</p>
        </div>
      </div>
    );
  }

  if (status?.status === "approved_payment_pending") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Complete Your Author Registration</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-3">Your author application has been approved.</p>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">Please complete the one-time registration payment within 24 hours to finalize your author registration.</p>
          <p className="text-2xl font-bold text-slate-800 mb-2">{status.currency} {status.amount}</p>
          <p className="text-green-700 font-semibold mb-8">{remaining}</p>
          <Button onClick={pay} disabled={paying} className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-lg">
            {paying ? "Processing..." : "Pay Registration Fee"}
          </Button>
          {message && <p className="mt-6 text-red-600 font-medium">{message}</p>}
        </div>
      </div>
    );
  }

  if (status?.status === "expired") {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><h2 className="text-3xl font-bold text-slate-800 mb-4">Author Registration Expired</h2><p className="text-lg text-slate-600">Your 24-hour payment period has expired, so the author registration could not be completed.</p></div>;
  }

  if (status?.status === "completed") {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><h2 className="text-3xl font-bold text-green-700 mb-4">Author Registration Complete 🎉</h2><p className="text-lg text-slate-600">You are now a registered Shoppers Ocean author.</p></div>;
  }

  if (message) return <div className="py-12 text-center text-red-600">{message}</div>;

  return <>{children}</>;
}
