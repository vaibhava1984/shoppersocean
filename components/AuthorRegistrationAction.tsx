"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function AuthorRegistrationAction({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  function proceed() {
    if (isLoggedIn) {
      router.push("/create-your-flipbook/register");
      return;
    }
    setShowPrompt(true);
  }

  return (
    <>
      <button type="button" onClick={proceed} className="inline-flex min-h-11 items-center justify-center rounded-md bg-green-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
        Register as Author
      </button>
      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPrompt(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="author-account-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-700">✍</div>
            <h2 id="author-account-title" className="text-center text-2xl font-bold text-slate-900">Become a Shoppers Ocean Author</h2>
            <p className="mt-3 text-center leading-relaxed text-slate-600">To begin author registration, please create a Shoppers Ocean account first. Already have an account? Sign in and then return here to continue.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => { setAuthMode("signup"); setShowPrompt(false); setShowAuth(true); }} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">Create Account</button>
              <button type="button" onClick={() => { setAuthMode("signin"); setShowPrompt(false); setShowAuth(true); }} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Sign In</button>
            </div>
            <button type="button" onClick={() => setShowPrompt(false)} className="mt-4 w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800">Maybe later</button>
          </section>
        </div>
      )}
      <AuthModal open={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} />
    </>
  );
}
