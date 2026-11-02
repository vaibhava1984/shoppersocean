"use client";

import Link from "next/link";

export default function GameQuotaNotice({ title = "Your three free trials are complete!", description = "Subscribe to continue playing and unlock more experiences across Shoppers Ocean." }: { title?: string; description?: string }) {
  return <div role="status" className="relative mx-auto my-5 max-w-2xl overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-6 text-center shadow-xl sm:p-8">
    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600" />
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-3xl text-white shadow-lg">✨</div>
    <p className="mt-4 text-xs font-black uppercase tracking-[.2em] text-violet-700">Keep the fun going</p>
    <h3 className="mt-2 text-xl font-black leading-8 text-slate-900 sm:text-2xl">{title}</h3>
    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
    <Link href="/subscribe-now" className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 px-7 py-3 font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">SUBSCRIBE NOW →</Link>
  </div>;
}
