import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscriptionPlanSelector from "@/components/SubscriptionPlanSelector";
import { requireUser } from "@/utils/auth/requireUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "Subscribe Now | Shoppers Ocean",
  description: "Choose a Shoppers Ocean plan and keep enjoying games, quizzes and challenges.",
};

export default async function SubscribeNowPage() {
  const identity = await requireUser();
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
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 text-sm leading-6 text-slate-700">📚 E-books and flipbooks are separate from subscriptions. Their existing access and purchase rules remain unchanged.</div>
          {!identity && <p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Please sign in or create an account before choosing a subscription plan. You will be redirected to sign in when you select a plan.</p>}
          <SubscriptionPlanSelector signedIn={Boolean(identity)} />
          <p className="mt-7 text-xs leading-5 text-slate-500">Access to subscription-covered features ends when the paid period expires. Your account remains available, and flipbooks follow their separate access rules.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
