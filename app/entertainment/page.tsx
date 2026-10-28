import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EntertainmentHub from "@/components/EntertainmentHub";
import { getCurrentUser } from "@/utils/auth/session";

export const metadata = {
  title: "Play Games & Brain Challenges",
  description: "Enjoy free browser games, quizzes, riddles, daily brain challenges, and flipbooks on Shoppers Ocean.",
};

export default async function EntertainmentPage() {
  const user = await getCurrentUser();
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl"/>
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl"/>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mb-5 inline-flex items-center rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-semibold not-italic text-blue-700 shadow-sm hover:bg-blue-50">← Back to Home</Link>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] not-italic text-blue-700">Shoppers Ocean · Play & Explore</p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-800 sm:text-5xl">Your World of <span className="text-blue-700">Entertainment</span></h1>
        <p className="mt-4 max-w-2xl text-base not-italic leading-7 text-slate-600 sm:text-lg">Enjoy quick games, stretch your mind with quizzes and riddles, take on a daily challenge, or explore beautiful flipbooks. All in one place.</p>
      </div>
    </section>
    <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8"><EntertainmentHub userId={user?.id ?? null} /></section>
    <Footer />
  </div>;
}
