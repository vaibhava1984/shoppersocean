import Link from "next/link";
import { Crown } from "lucide-react";
export default function FloatingSubscribeButton() {
  return <Link href="/subscribe-now" aria-label="Subscribe Now" className="fixed bottom-5 right-4 z-[90] inline-flex min-h-12 items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_8px_28px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 sm:bottom-7 sm:right-7 sm:px-5"><Crown className="h-5 w-5" aria-hidden="true" /><span>Subscribe Now</span></Link>;
}
