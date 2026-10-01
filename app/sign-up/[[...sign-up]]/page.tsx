"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const countries = ["IN", "US", "GB", "AE", "CA", "AU", "SG"];

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Unable to create your account right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
          <input className="w-full rounded-md border px-4 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
          <select className="w-full rounded-md border px-4 py-2" value={country} onChange={(e) => setCountry(e.target.value)} required>
            {countries.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
          <input className="w-full rounded-md border px-4 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
          <input className="w-full rounded-md border px-4 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (minimum 6 characters)" minLength={6} autoComplete="new-password" required />
          <button className="w-full rounded-md bg-blue-600 text-white py-2 disabled:bg-gray-400" disabled={busy}>
            {busy ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-5 text-center text-sm">
          Already have an account? <Link href="/sign-in" className="text-blue-600">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
