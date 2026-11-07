"use client";
import Link from "next/link";
export default function GameQuotaNotice({isPrivileged=false}:{isPrivileged?:boolean}) {
 const message=isPrivileged?"Your quota for this section today has been exhausted. Please visit tomorrow to play again.":"Your free quota for this section has been exhausted. Please subscribe to enjoy further.";
 return <div role="status" className="relative mx-auto my-5 w-full max-w-2xl basis-full overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-5 text-center shadow-xl sm:p-8">
  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600"/>
  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-3xl text-white shadow-lg">{isPrivileged?"⏰":"✨"}</div>
  <p className="mt-4 text-xs font-black uppercase tracking-[.2em] text-violet-700">{isPrivileged?"Daily quota complete":"Keep the fun going"}</p>
  <h3 className="mx-auto mt-2 max-w-xl text-lg font-black leading-7 text-slate-900 sm:text-2xl sm:leading-8">{message}</h3>
  {!isPrivileged&&<Link href="/subscribe-now" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 px-7 py-3 font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">SUBSCRIBE NOW →</Link>}
 </div>;
}
