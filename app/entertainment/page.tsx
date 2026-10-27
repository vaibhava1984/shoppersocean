import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EntertainmentHub from "@/components/EntertainmentHub";

export const metadata = {
  title: "Play Games & Brain Challenges",
  description: "Enjoy free browser games, quizzes, riddles, daily brain challenges, and flipbooks on Shoppers Ocean.",
};

export default function EntertainmentPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <section className="relative isolate overflow-hidden bg-[#07152f] py-14 text-white sm:py-20"><div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 -z-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"/><div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"/>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mb-5 inline-block text-sm not-italic text-white/90">← Home</Link>
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] not-italic text-cyan-100">Shoppers Ocean</p>
        <h1 className="mt-3 text-4xl font-black not-italic leading-tight sm:text-6xl">Your World of Entertainment</h1>
        <p className="mt-4 max-w-2xl text-base not-italic leading-7 text-slate-300 sm:text-lg">Play a quick game, stretch your mind with a quiz, solve today's challenge, or explore a flipbook. Everything here is free to try.</p>
      </div>
    </section>
    <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8"><EntertainmentHub /></section>
    <Footer />
  </div>;
}
