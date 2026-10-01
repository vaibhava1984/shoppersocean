"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
          <input className="w-full rounded-md border px-4 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
          <input className="w-full rounded-md border px-4 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />
          <button className="w-full rounded-md bg-blue-600 text-white py-2 disabled:bg-gray-400" disabled={busy}>
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-5 text-center text-sm">
          <Link href="/reset-password" className="text-blue-600">Forgot password?</Link>
        </div>
        <div className="mt-3 text-center text-sm">
          New user? <Link href="/sign-up" className="text-blue-600">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
