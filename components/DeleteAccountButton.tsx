"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, ShieldAlert, Trash2, X } from "lucide-react";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount() {
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
      window.location.replace("/");
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
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:from-rose-800 hover:to-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
      >
        <Trash2 className="h-4 w-4" />
        Delete My Account
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[2147483000] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setOpen(false); }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="account-deletion-heading"
            aria-describedby="account-deletion-details"
            className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-800 via-red-700 to-orange-500 px-6 py-7 text-white sm:px-8">
              <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
              <button
                type="button"
                aria-label="Close confirmation"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-inner">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <p className="relative text-xs font-extrabold uppercase tracking-[0.22em] text-rose-100">Important account notice</p>
              <h2 id="account-deletion-heading" className="relative mt-2 text-2xl font-black leading-tight sm:text-3xl">Are you sure you want to delete your account?</h2>
              <p className="relative mt-2 max-w-md text-sm leading-6 text-white/90">Please read carefully. Deleting your Shoppers Ocean account is permanent and cannot be undone.</p>
            </div>

            <div id="account-deletion-details" className="space-y-4 px-6 py-6 sm:px-8">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <p className="text-sm font-semibold leading-6 text-amber-950">If you proceed, the following books, benefits and author-related records associated with your account will be permanently lost:</p>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">1</span>
                  <span className="text-sm leading-6 text-slate-700"><strong className="text-slate-900">Purchased books:</strong> all books you have purchased and your access to those books will be lost.</span>
                </li>
                <li className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">2</span>
                  <span className="text-sm leading-6 text-slate-700"><strong className="text-slate-900">Subscription:</strong> if you have an active subscription, it and all its remaining benefits will be lost.</span>
                </li>
                <li className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">3</span>
                  <span className="text-sm leading-6 text-slate-700"><strong className="text-slate-900">Published books:</strong> all books you have published on Shoppers Ocean as an author will be removed.</span>
                </li>
                <li className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700">4</span>
                  <span className="text-sm leading-6 text-slate-700"><strong className="text-slate-900">Author revenue:</strong> all revenue and earnings associated with your author account, including any unpaid amount, will be lost.</span>
                </li>
              </ul>
              <p className="text-center text-xs font-bold leading-5 text-red-700">This deletion is final. Your account and its associated data cannot be restored.</p>
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setOpen(false)}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:min-w-32"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={deleteAccount}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 transition hover:from-rose-800 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-40"
                >
                  {deleting ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting...</> : "Sure to delete"}
                </button>
              </div>
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
