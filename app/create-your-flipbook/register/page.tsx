"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = { fullName: string; email: string; country: string; gender: string; city: string };

export default function AuthorRegisterPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", city: "", country: "", gender: "" });
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
        setForm({ fullName: d.profile.fullName, email: d.profile.email, country: d.profile.country, city: d.profile.city, gender: d.profile.gender });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
            <div><Label>Full name*</Label><Input className="mt-1 bg-slate-100" value={form.fullName} readOnly /></div>
            <div><Label>E-mail ID* (same as user ID)</Label><Input className="mt-1 bg-slate-100" value={form.email} readOnly /></div>
            <div><Label>City*</Label><Input className="mt-1 bg-slate-100" value={form.city} readOnly /></div>
            <div><Label>Country* (same as user registration)</Label><Input className="mt-1 bg-slate-100" value={form.country} readOnly /></div>
            <div><Label>Gender*</Label><Input className="mt-1 bg-slate-100" value={form.gender} readOnly /></div>
          </div>

          <label className="flex items-start gap-3 text-slate-700 leading-relaxed cursor-pointer">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>I ({form.fullName || "Your name"})* confirm that I have read, understood, and agree to all <Link href="/author-policies#author-policies" className="font-semibold text-blue-700 underline">Author Policies</Link>. I also declare that the information I have provided is true and accurate to the best of my knowledge.</span>
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
