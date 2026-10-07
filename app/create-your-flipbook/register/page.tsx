"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = { fullName: string; email: string; country: string };

const titles = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const genders = ["Male", "Female", "Other", "Prefer not to say"];

export default function AuthorRegisterPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ title: "", fullName: "", email: "", city: "", country: "", age: "", gender: "", paypalId: "", upiNumber: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/author-application/profile", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Please sign in to register as an author.");
        setProfile(d.profile);
        setForm((f) => ({ ...f, fullName: d.profile.fullName, email: d.profile.email, country: d.profile.country }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const isIndia = profile?.country === "India";
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    setError("");
    if (!accepted) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/author-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to submit your application.");
      router.push("/create-your-flipbook/submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>;

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-xl mx-auto px-5 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Author Registration</h1>
          <p className="text-lg text-slate-600 mb-8">{error}</p>
          <Link href="/login"><Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Author Registration</h1>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-10 space-y-6">
          {error && <p className="text-red-600 font-medium">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-5">
            <div><Label>Title*</Label><select className="w-full h-10 border rounded-md px-3 mt-1" value={form.title} onChange={(e) => set("title", e.target.value)}><option value="">Select</option>{titles.map((v) => <option key={v}>{v}</option>)}</select></div>
            <div><Label>Full name*</Label><Input className="mt-1" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
            <div><Label>E-mail ID* (same as user ID)</Label><Input className="mt-1 bg-slate-100" value={form.email} readOnly /></div>
            <div><Label>City*</Label><Input className="mt-1" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div><Label>Country* (same as user registration)</Label><Input className="mt-1 bg-slate-100" value={form.country} readOnly /></div>
            <div><Label>Age*</Label><Input className="mt-1" type="number" min="1" max="120" value={form.age} onChange={(e) => set("age", e.target.value)} /></div>
            <div><Label>Gender*</Label><select className="w-full h-10 border rounded-md px-3 mt-1" value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select</option>{genders.map((v) => <option key={v}>{v}</option>)}</select></div>
            {!isIndia && <div className="sm:col-span-2"><Label>PayPal ID (For outside India)</Label><Input className="mt-1" value={form.paypalId} onChange={(e) => set("paypalId", e.target.value)} /></div>}
            {isIndia && <div className="sm:col-span-2"><Label>Number connected with UPI</Label><Input className="mt-1" value={form.upiNumber} onChange={(e) => set("upiNumber", e.target.value)} /><p className="text-sm text-slate-500 mt-1">For Indian authors, the name should match the name used for creating your Shoppers Ocean account.</p></div>}
          </div>

          <label className="flex items-start gap-3 text-slate-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>I ({form.fullName || "Your name"})* have read everything carefully and hereby declare that the information provided by me is true to my belief and there is no false information of details given by me.</span>
          </label>

          <div className="text-center pt-2">
            <Button disabled={!accepted || submitting} onClick={submit} className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 text-lg disabled:opacity-50">
              {submitting ? "Submitting..." : "Proceed"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
