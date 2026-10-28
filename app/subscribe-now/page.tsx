import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Subscribe Now | Shoppers Ocean",
  description: "Continue enjoying games, quizzes and brain challenges on Shoppers Ocean.",
};

export default function SubscribeNowPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <main className="relative isolate overflow-hidden px-4 py-16 sm:py-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white bg-white/90 p-7 text-center shadow-xl ring-1 ring-slate-200 sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-3xl">🌊</div>
        <p className="mt-5 text-xs font-black uppercase tracking-[.22em] text-blue-700">Shoppers Ocean Membership</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Subscribe Now</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">Thank you for enjoying Shoppers Ocean. Our subscription details will be presented here shortly.</p>
        <Link href="/" className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white shadow transition hover:bg-blue-800">Back to Home</Link>
      </div>
    </main>
    <Footer />
  </div>;
}
