import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Subscribe Now | Shoppers Ocean",
  description: "Choose a Shoppers Ocean plan and keep enjoying games, quizzes and challenges.",
};

const plans = [
  { name: "1 Month", duration: "30 days", price: "₹299", value: 299 },
  { name: "3 Months", duration: "90 days", price: "₹850", value: 850 },
  { name: "6 Months", duration: "180 days", price: "₹1,550", value: 1550 },
  { name: "12 Months", duration: "365 days", price: "₹3,000", value: 3000, featured: true },
];

export default function SubscribeNowPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <main className="relative isolate overflow-hidden px-4 py-12 sm:py-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white bg-white/95 p-6 text-center shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-3xl">🌊</div>
          <p className="mt-5 text-xs font-black uppercase tracking-[.22em] text-blue-700">Shoppers Ocean Membership</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Your Next Adventure Awaits</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Enjoy games, quizzes, brain challenges, exercises and engaging activities in one worldwide entertainment hub. We continually work to keep the experience fresh, useful and fun.</p>
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-6 text-slate-700">📚 E-books and flipbooks are separate from subscriptions. Their existing access and purchase rules will remain unchanged.</div>
          <h2 id="plans" className="mt-10 text-2xl font-black text-slate-900 sm:text-3xl">Choose Your Subscription Plan</h2>
          <p className="mt-2 text-sm text-slate-500">Choose the duration that suits you best.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.featured ? "border-blue-500 bg-gradient-to-b from-blue-50 to-white ring-2 ring-blue-200" : "border-slate-200 bg-white"}`}>
              {plan.featured && <span className="mb-3 self-start rounded-full bg-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Best Value</span>}
              <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{plan.duration} of membership</p>
              <p className="mt-4 text-3xl font-black tracking-tight text-blue-800">{plan.price}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Access to subscription-covered entertainment features while your plan is active.</p>
              <Link href={`/subscribe-now?plan=${encodeURIComponent(plan.name)}&amount=${plan.value}`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-extrabold text-white shadow transition hover:bg-blue-800">Choose Plan</Link>
            </div>)}
          </div>
          <p className="mt-7 text-xs leading-5 text-slate-500">Subscription access ends when the paid period expires. Flipbooks remain governed by their separate access rules.</p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Back to Home</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
