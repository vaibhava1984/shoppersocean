"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function continueDelete() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete your account. Please try again.");
      try { localStorage.removeItem("shoppers-ocean-last-activity"); } catch {}
      window.location.replace("/?account_deleted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete your account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(""); setOpen(true); }}
        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-red-700/90 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
      >
        <Trash2 className="h-4 w-4" />
        Delete my account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-r from-rose-700 via-red-600 to-orange-500 px-6 py-7 text-white sm:px-8">
              <button
                type="button"
                aria-label="Close"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/90 transition hover:bg-white/15 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-100">Account deletion</p>
              <h2 id="delete-account-title" className="mt-2 text-2xl font-extrabold sm:text-3xl">Are you sure you want to leave?</h2>
              <p className="mt-2 text-sm leading-6 text-white/90">This action is permanent and cannot be undone.</p>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8">
              <p className="font-semibold text-slate-800">If you delete your Shoppers Ocean account, you will lose:</p>
              <ul className="space-y-3 text-sm leading-6 text-slate-600">
                <li className="flex gap-3"><span className="font-bold text-red-600">•</span><span>All books and other purchases linked to your account.</span></li>
                <li className="flex gap-3"><span className="font-bold text-red-600">•</span><span>Your active subscription and its remaining benefits.</span></li>
                <li className="flex gap-3"><span className="font-bold text-red-600">•</span><span>Books, works and submissions associated with your author account.</span></li>
              </ul>
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Keep my account
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={continueDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {deleting ? "Deleting account..." : "Continue to delete"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
