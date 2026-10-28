import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscriptionPlanSelector from "@/components/SubscriptionPlanSelector";
import { requireUser } from "@/utils/auth/requireUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "Subscribe Now | Shoppers Ocean",
  description: "Choose a Shoppers Ocean entertainment subscription plan.",
};

export default async function SubscribeNowPage() {
  const identity = await requireUser();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-5 py-8 text-center text-white shadow-xl sm:px-10 sm:py-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-cyan-200">Shoppers Ocean</p>
            <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">One World. Endless Entertainment. New Challenges.</h1>
          </section>

          <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
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
              <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">Your access to subscription-based facilities depends on your selected plan. Access to subscription-protected services ends when your subscription expires.</p>
              <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">You will receive a reminder email three days before your subscription expires so you can renew it and continue enjoying the facilities.</p>
            </div>

            <div className="mt-8 text-center">
              <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">Ready to Begin?</h2>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">Choose the subscription plan that suits you and unlock a world of entertainment, knowledge, and exciting challenges with Shoppers Ocean.</p>
            </div>
          </section>

          {!identity && <p className="mx-auto mt-5 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm leading-6 text-amber-900">Please sign in or create an account before subscribing. Select a plan below to continue securely.</p>}
          <SubscriptionPlanSelector signedIn={Boolean(identity)} />

          <p className="mx-auto mt-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm leading-6 text-amber-900">
            Entertainment subscriptions cover subscription-based games and activities only. E-books and flipbooks are not included in any plan.
          </p>
          <div className="mt-8 text-center"><a href="/" className="font-bold text-blue-700 hover:text-blue-900">← Back to homepage</a></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
