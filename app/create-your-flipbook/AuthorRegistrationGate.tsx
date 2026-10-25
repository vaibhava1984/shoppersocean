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
  const [submissionStatus, setSubmissionStatus] = useState("available");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");

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

  useEffect(() => {
    if (status?.status !== "completed" || policiesOnly) return;
    let active = true;
    setUploadLoading(true);
    fetch("/api/author-book-submission", { cache: "no-store", credentials: "same-origin" })
      .then(async (r) => { const data=await r.json(); if(!r.ok) throw new Error(data.error || "Unable to check book submission status."); return data; })
      .then((data) => { if(active) { setCooldownUntil(data.cooldownUntil || ""); setReviewNotice(data.status === "rejected" ? "We’re sorry, but after review, your submitted book could not be approved because it did not meet Shoppers Ocean’s Community Guidelines or Author Policies. We appreciate your understanding and encourage you to review the policies before submitting another book." : ""); setSubmissionStatus(data.status === "rejected" && data.cooldownUntil && Date.now() >= new Date(data.cooldownUntil).getTime() ? "available" : (data.status || "available")); } })
      .catch((e) => { if(active) setUploadError(e.message || "Unable to check submission status."); })
      .finally(() => { if(active) setUploadLoading(false); });
    return () => { active=false; };
  }, [status?.status, policiesOnly]);

  async function submitBook() {
    if (!bookFile || !coverFile) { setUploadMessage("Please select both your DOCX manuscript and cover page."); return; }
    if (bookFile.size > 2*1024*1024) { setUploadMessage("Your DOCX manuscript must not exceed 2 MB."); return; }
    if (!bookFile.name.toLowerCase().endsWith(".docx")) { setUploadMessage("Dear author, only DOCX file format is supported"); return; }
    if (coverFile.size > 200*1024) { setUploadMessage("Your cover image must not exceed 200 KB."); return; }
    if (!/\.(jpe?g|png|webp)$/i.test(coverFile.name)) { setUploadMessage("Please upload a JPG, PNG, or WebP cover image."); return; }
    setSubmitting(true); setUploadMessage(""); setUploadError("");
    try {
      const data=new FormData(); data.append("book",bookFile); data.append("cover",coverFile);
      const response=await fetch("/api/author-book-submission",{method:"POST",body:data,credentials:"same-origin"});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error || "Your book could not be submitted.");
      setSubmissionStatus("pending"); setBookFile(null); setCoverFile(null);
      router.push("/");
    } catch(e) { setUploadError(e instanceof Error ? e.message : "Your book could not be submitted. Please try again."); }
    finally { setSubmitting(false); }
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
    const cooldownText = cooldownUntil ? (() => {
      const left = Math.max(0, new Date(cooldownUntil).getTime() - Date.now());
      const hours = Math.floor(left / 3600000);
      const minutes = Math.floor((left % 3600000) / 60000);
      return `${hours} hours ${minutes} minutes`;
    })() : "";
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        {submissionStatus === "pending" ? (
          <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-blue-700">Your Book Is Under Review</h2>
            <p className="text-lg leading-relaxed text-slate-600">Your book has been submitted successfully and is now under review. If it meets our Community Guidelines and Author Policies, it will be published within 2–3 working days.</p>
          </div>
        ) : submissionStatus === "rejected" ? (
          <div className="rounded-xl border border-amber-200 bg-white p-8 shadow-sm sm:p-12">
            <h2 className="mb-4 text-3xl font-bold text-slate-800">An Update on Your Book Submission</h2>
            <p className="text-lg leading-relaxed text-slate-600">We’re sorry, but after review, your submitted book could not be approved because it did not meet Shoppers Ocean’s Community Guidelines or Author Policies. We appreciate your understanding and encourage you to review the policies before submitting another book.</p>
            {cooldownUntil && <p className="mt-5 text-base text-slate-500">You may submit another book in {cooldownText}.</p>}
          </div>
        ) : submissionStatus === "cooldown" ? (
          <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-blue-700">Thank You for Your Submission</h2>
            <p className="text-lg leading-relaxed text-slate-600">Your previous submission has been reviewed. You may submit one book every 24 hours.</p>
            <p className="mt-4 text-base text-slate-500">You can submit another book in {cooldownText}.</p>
          </div>
        ) : (
          <>
            {reviewNotice && <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-base leading-relaxed text-amber-900">{reviewNotice}</p>}
            <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm sm:p-12">
              <h2 className="mb-5 text-2xl font-bold text-blue-700 sm:text-3xl">Hello, {status.fullName || fullName || "Author"}!</h2>
              <p className="mb-5 text-lg leading-relaxed text-slate-600">Welcome to the Shoppers Ocean Author Family! As a registered author, you now have the opportunity to share your creativity and showcase your talent to readers around the world. You may submit <strong>one book every 24 hours</strong>, subject to the following submission guidelines.</p>
              <h3 className="mb-2 text-xl font-semibold text-slate-800">Book Submission Guidelines</h3>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-lg leading-relaxed text-slate-600">
                <li><strong>Book Manuscript:</strong> Submit your book in DOCX format only. Other file formats will not be accepted.</li>
                <li><strong>File Size:</strong> Your manuscript must not exceed 2 MB.</li>
                <li><strong>Cover Page:</strong> Upload a professionally designed cover page in JPG, PNG, or WebP format. The file size must not exceed 200 KB.</li>
              </ul>
              <h3 className="mb-2 text-xl font-semibold text-slate-800">Review and Publication</h3>
              <p className="mb-5 text-lg leading-relaxed text-slate-600">Every submitted manuscript will undergo a review process. Once your book has been reviewed and approved, it will be published on Shoppers Ocean within <strong>2–3 working days</strong>, subject to our review and publication process.</p>
              <p className="mb-5 text-lg leading-relaxed text-slate-600">For further information about submission requirements and publication guidelines, please refer to our <Link href="/create-your-flipbook?policies=1#author-policies" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">Author Policies</Link>.</p>
              <p className="text-lg leading-relaxed text-slate-600">We look forward to showcasing your work and bringing your stories to readers across the globe!</p>
              <p className="mt-6 text-lg font-semibold text-slate-700">Warm regards,<br />Team Shoppers Ocean</p>
            </div>
            <div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="mb-5 text-xl font-bold text-slate-800">Submit Your Book</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Book manuscript (DOCX, max 2 MB)</p>
                  <input id="author-book-file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { const file=e.target.files?.[0]||null; setBookFile(file); setUploadMessage(file && file.size>2*1024*1024 ? "Your DOCX manuscript must not exceed 2 MB." : file && !file.name.toLowerCase().endsWith(".docx") ? "Dear author, only DOCX file format is supported" : ""); }} className="hidden" />
                  <label htmlFor="author-book-file" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Submit Your DOCX File</label>
                  <p className="mt-3 break-all text-sm text-slate-500">{bookFile ? bookFile.name : "No manuscript selected"}</p>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Cover page (JPG, PNG, WebP; max 200 KB)</p>
                  <input id="author-cover-file" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => { const file=e.target.files?.[0]||null; setCoverFile(file); setUploadMessage(file && file.size>200*1024 ? "Your cover image must not exceed 200 KB." : file && !/\.(jpe?g|png|webp)$/i.test(file.name) ? "Please upload a JPG, PNG, or WebP cover image." : ""); }} className="hidden" />
                  <label htmlFor="author-cover-file" className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Submit Your Cover Page</label>
                  <p className="mt-3 break-all text-sm text-slate-500">{coverFile ? coverFile.name : "No cover page selected"}</p>
                </div>
              </div>
              {uploadMessage && <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{uploadMessage}</p>}
              {uploadError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{uploadError}</p>}
              <div className="mt-6">
                <Button onClick={submitBook} disabled={submitting || !bookFile || !coverFile} className="w-full bg-blue-600 px-6 py-4 text-base font-semibold text-white hover:bg-blue-700 sm:w-auto">
                  {submitting ? "Submitting..." : "Submit Book for Review"}
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-500">Both files are submitted together. Your submission will be securely sent to the Shoppers Ocean review team.</p>
            </div>
          </>
        )}
        {uploadLoading && <p className="mt-4 text-center text-sm text-slate-500">Checking your previous book submission...</p>}
      </div>
    );
  }

  if (message) return <div className="py-12 text-center text-red-600">{message}</div>;

  return <>{children}</>;
}
