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
  { name: "1 Month", price: "₹299", value: "1-month", featured: false },
  { name: "3 Months", price: "₹850", value: "3-months", featured: false },
  { name: "6 Months", price: "₹1,550", value: "6-months", featured: true },
  { name: "12 Months", price: "₹3,000", value: "12-months", featured: false },
];

export default async function SubscribePage() {
  const user = await getCurrentUser();
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-4 py-12 text-center text-white sm:py-16">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-cyan-200 sm:text-base">Shoppers Ocean</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">One World. Endless Entertainment. New Challenges.</h1>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-base leading-8 text-slate-700 sm:text-lg">
            Welcome to Shoppers Ocean, a worldwide entertainment hub offering exciting games, quizzes, brain exercises, daily challenges, and many engaging activities. Our goal is to provide quality entertainment, encourage learning, and bring you fresh, interesting experiences with minimal repetition.
          </p>

          <div className="mt-8">
            <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">Why Subscribe?</h2>
            <ul className="mt-4 space-y-3 text-base leading-7 text-slate-700 sm:text-lg">
              <li className="flex gap-3"><span className="font-black text-blue-600">✓</span><span>Enjoy our entertainment facilities according to your chosen subscription plan.</span></li>
              <li className="flex gap-3"><span className="font-black text-blue-600">✓</span><span>Challenge yourself with games, quizzes, brain exercises, and engaging activities.</span></li>
              <li className="flex gap-3"><span className="font-black text-blue-600">✓</span><span>Discover fresh challenges designed to keep your experience interesting.</span></li>
              <li className="flex gap-3"><span className="font-black text-blue-600">✓</span><span>Enjoy an entertaining experience that combines fun, knowledge, and mental activity.</span></li>
            </ul>
          </div>

          <div className="mt-8 rounded-2xl bg-indigo-50 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold text-indigo-950 sm:text-3xl">E-books and Flipbooks</h2>
            <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">
              Shoppers Ocean also offers beautifully designed online e-books in multiple languages and provides an exclusive platform for authors to publish their books. E-books and flipbooks are separate from entertainment subscriptions and are not included in any subscription plan.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">Your Subscription, Your Access</h2>
            <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">
              Your access to subscription-based facilities depends on your selected plan. Access to subscription-protected services ends when your subscription expires.
            </p>
            <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">
              You will receive a reminder email three days before your subscription expires so you can renew it and continue enjoying the facilities.
            </p>
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">Ready to Begin?</h2>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
              Choose the subscription plan that suits you and unlock a world of entertainment, knowledge, and exciting challenges with Shoppers Ocean.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Choose Your Subscription Plan</h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">Select the duration that works best for you.</p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.value} className={`relative flex flex-col rounded-2xl border bg-white p-5 text-center shadow-lg transition hover:-translate-y-1 ${plan.featured ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}>
              {plan.featured && <span className="mb-3 self-center rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">POPULAR CHOICE</span>}
              <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
              <p className="mt-3 text-3xl font-black text-blue-800 sm:text-4xl">{plan.price}</p>
              <Link href={user ? `/account?subscription=${plan.value}` : `/?subscribe=${plan.value}`} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-extrabold text-white shadow-md transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {user ? `Continue — ${plan.price}` : `Sign in — ${plan.price}`}
              </Link>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm leading-6 text-amber-900">
          Entertainment subscriptions cover subscription-based games and activities only. E-books and flipbooks are not included.
        </p>
        <div className="mt-8 text-center"><Link href="/" className="font-bold text-blue-700 hover:text-blue-900">← Back to homepage</Link></div>
      </section>
      <Footer />
    </main>
  );
}
