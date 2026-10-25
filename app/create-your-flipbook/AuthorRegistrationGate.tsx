"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Status = {
  status: string;
  paymentDeadline: string | null;
  amount?: number;
  currency?: string;
  title?: string;
  fullName?: string;
  email?: string;
  city?: string;
  country?: string;
  age?: number;
  gender?: string;
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
  const [policiesOnly, setPoliciesOnly] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    setPoliciesOnly(new URLSearchParams(window.location.search).get("policies") === "1");
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/author-application/payment", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => {
        if (r.status === 401) return null;
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to read registration status.");
        return data;
      })
      .then((data) => {
      if (active) {
        setStatus(data);
        setTitle(data?.title || "");
        setFullName(data?.fullName || "");
        setEmail(data?.email || "");
        setCity(data?.city || "");
        setCountry(data?.country || "");
        setAge(data?.age ? String(data.age) : "");
        setGender(data?.gender || "");
      }
    })
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
        body: JSON.stringify({
          action: "create",
          title,
          fullName,
          city,
          age: Number(age),
          gender,
        }),
      });
      const order = await response.json();
      if (!response.ok) {
        if (order.status === "expired" || order.status === "not_started") {
          setStatus({ status: "not_started", paymentDeadline: null });
          setMessage("");
          return;
        }
        throw new Error(order.error || "Unable to create payment order.");
      }

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
          if (!verify.ok && (result.status === "expired" || result.status === "not_started")) {
            setStatus({ status: "not_started", paymentDeadline: null });
            setMessage("");
            return;
          }
          if (!verify.ok || result.status !== "completed") throw new Error(result.error || "Payment could not be verified.");
          setStatus({ status: "completed", paymentDeadline: null, fullName });
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

  if (policiesOnly) return <>{children}</>;

  if (loading) return <div className="py-12 text-center text-slate-600">Checking your author registration status...</div>;

  if (status?.status === "pending") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12">
          <h2 className="mb-4 text-3xl font-bold text-blue-700">Your Application Is Under Review</h2>
          <p className="text-lg leading-relaxed text-slate-600">Your application is under review, we will get back to you shortly.</p>
        </div>
      </div>
    );
  }

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
    const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Complete Your Author Registration</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 text-center">Your author application has been approved. fill the following details</p>

          <div className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">Title*</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mr., Ms., Mrs., Dr., etc." />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">Full Name*</label>
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">E-mail ID*</label>
              <input className={inputClass + " bg-slate-100"} value={email} readOnly />
              <p className="mt-1 text-sm text-slate-500">Same as the user's account email</p>
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">City*</label>
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">Country*</label>
              <input className={inputClass + " bg-slate-100"} value={country} readOnly />
              <p className="mt-1 text-sm text-slate-500">Taken from your registration country</p>
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">Age*</label>
              <input className={inputClass} type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">Gender*</label>
              <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed mt-8 mb-4 text-center">Please complete the one-time registration payment within three days to finalize your author registration.</p>
          <p className="text-2xl font-bold text-slate-800 text-center mb-2">{status.currency} {status.amount}</p>
          <p className="text-green-700 font-semibold text-center mb-8">{remaining}</p>
          <div className="text-center">
            <Button onClick={pay} disabled={paying} className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-lg">
              {paying ? "Processing..." : "Pay Registration Fee"}
            </Button>
          </div>
          {message && <p className="mt-6 text-red-600 font-medium text-center">{message}</p>}
        </div>
      </div>
    );
  }

  if (status?.status === "expired") {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><h2 className="text-3xl font-bold text-slate-800 mb-4">Author Registration Expired</h2><p className="text-lg text-slate-600">Your three-day payment period has expired, so the author registration could not be completed.</p></div>;
  }

  if (status?.status === "completed") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12">
          <h2 className="mb-5 text-2xl font-bold text-blue-700 sm:text-3xl">Hello, {status.fullName || fullName || "Author"}!</h2>
          <p className="mb-5 text-lg leading-relaxed text-slate-600">Welcome to the Shoppers Ocean Author Family! As a registered author, you now have the opportunity to share your creativity and showcase your talent to readers around the world. You may submit <strong>one book every 24 hours</strong>, subject to the following submission guidelines.</p>
          <h3 className="mb-2 text-xl font-semibold text-slate-800">Book Submission Guidelines</h3>
          <ul className="mb-6 list-disc space-y-2 pl-6 text-lg leading-relaxed text-slate-600">
            <li><strong>Book Manuscript:</strong> Submit your book in DOCX format only. Other file formats will not be accepted.</li>
            <li><strong>File Size:</strong> Your manuscript must not exceed 2 MB.</li>
            <li><strong>Cover Page:</strong> Upload a professionally designed cover page in a commonly supported image format. The file size must not exceed 200 KB.</li>
          </ul>
          <h3 className="mb-2 text-xl font-semibold text-slate-800">Review and Publication</h3>
          <p className="mb-5 text-lg leading-relaxed text-slate-600">Every submitted manuscript will undergo a review process. Once your book has been reviewed and approved, it will be published on Shoppers Ocean within <strong>2–3 working days</strong>, subject to our review and publication process.</p>
          <p className="mb-5 text-lg leading-relaxed text-slate-600">For further information about submission requirements and publication guidelines, please refer to our <Link href="/create-your-flipbook?policies=1#author-policies" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">Author Policies</Link>.</p>
          <p className="text-lg leading-relaxed text-slate-600">We look forward to showcasing your work and bringing your stories to readers across the globe!</p>
          <p className="mt-6 text-lg font-semibold text-slate-700">Warm regards,<br />Team Shoppers Ocean</p>
        </div>
      </div>
    );
  }

  if (message) return <div className="py-12 text-center text-red-600">{message}</div>;

  return <>{children}</>;
}
