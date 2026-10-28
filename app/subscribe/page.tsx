import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth/session";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Subscribe Now | Shoppers Ocean",
  description: "Choose a Shoppers Ocean entertainment subscription plan.",
};

const plans = [
  { name: "1 Month", price: "₹299", detail: "A month of entertainment", featured: false },
  { name: "3 Months", price: "₹850", detail: "Great for regular players", featured: false },
  { name: "6 Months", price: "₹1,550", detail: "More time for daily challenges", featured: true },
  { name: "12 Months", price: "₹3,000", detail: "Best value for a full year", featured: false },
];

export default async function SubscribePage() {
  const user = await getCurrentUser();
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-4 py-14 text-center text-white sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">Your next favourite escape</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Subscribe to Shoppers Ocean</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">Unlock entertainment designed to keep your mind active and your day exciting—with games, quizzes, exercises and fresh challenges.</p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Choose your plan</h2>
          <p className="mt-3 text-slate-600">Pick the duration that works best for you.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-lg transition hover:-translate-y-1 ${plan.featured ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}>
              {plan.featured && <span className="mb-3 self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">POPULAR CHOICE</span>}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2 min-h-10 text-sm text-slate-500">{plan.detail}</p>
              <p className="mt-5 text-4xl font-black text-blue-800">{plan.price}</p>
              <p className="mt-1 text-xs text-slate-500">INR · one-time plan price</p>
              <Link href={user ? "/account" : "/"} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white shadow transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{user ? "Continue" : "Sign in to continue"}</Link>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">One ocean. Many ways to enjoy.</h2>
          <p className="mt-2 leading-7 text-slate-600">Explore games, quizzes, exercise and activities, with new challenges designed to keep things interesting. Shoppers Ocean also offers beautifully designed online flipbooks and a place for authors to publish their books.</p>
          <p className="mt-3 text-sm font-semibold text-slate-700">E-books and flipbooks are separate from entertainment subscriptions.</p>
        </div>
        <div className="mt-8 text-center"><Link href="/" className="font-semibold text-blue-700 hover:text-blue-900">← Back to homepage</Link></div>
      </section>
      <Footer />
    </main>
  );
}
