import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'
import ContactForm from './components/ContactForm';
import AuthorApplicationBanner from './components/AuthorApplicationBanner';
import TestimonialSection from './components/TestimonialSection';
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import TrendingBooks from "@/components/trending_books";
import BooksCollections from "@/components/books_collections";
import HeroSection from "@/components/HeroSection";
import { getHomepageBooksServer } from "@/utils/homepageBooksServer";
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Read Digital Flipbooks & E-books in Multiple Languages',
  description: 'Discover digital flipbooks and e-books in multiple languages at Shoppers Ocean. Explore stories from independent authors, browse books by language, and enjoy reading from around the world.',
}

export default async function LandingPage() {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");
  const [user, homepageBooks, authorsResult, languageRowsResult] = await Promise.all([
    getCurrentUser(),
    getHomepageBooksServer(),
    db.prepare("SELECT id AS author_id,name FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name ASC").all<{author_id:string;name:string}>(),
    db.prepare("SELECT language FROM books WHERE COALESCE(is_deleted,0)=0 AND language IS NOT NULL").all<{language:string}>(),
  ]);
  const authors = authorsResult.results ?? [];
  const languages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...(languageRowsResult.results ?? []).map((row) => row.language).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} categoryNavigation={{ authors, languages }} />
      <div>
        <HeroSection
          title="Shoppers Ocean"
          subtitle="One World. Many Languages. Amazing E-books. Beautiful Stories."
          welcomeName={user?.firstName || undefined}
          isAdmin={user?.publicMetadata?.userrole === "ADMIN"}
          isAuthor={Boolean(user?.publicMetadata?.isAuthor) && user?.publicMetadata?.userrole !== "ADMIN"}
          buttonText=" Embark on Your Adventure"
          buttonLink="/bookShelf"
          imageSrc="/homepage_hero (1).jpeg"
          imageAlt=" Embark on Your Adventure"
        />
      </div>
      <section className="relative isolate overflow-hidden bg-[#07152f] py-14 text-white sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.09]" style={{backgroundImage:"radial-gradient(#ffffff 1px, transparent 1px)",backgroundSize:"22px 22px"}} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] not-italic text-cyan-100">✦ Shoppers Ocean Entertainment</span>
            <h2 className="mt-5 text-4xl font-black not-italic leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Your World of <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">Entertainment</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-base not-italic leading-7 text-slate-300 sm:text-lg">Eight ways to play, explore, challenge your mind, and discover your next favourite story.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold not-italic text-slate-200"><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">FREE TO TRY</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">NO DOWNLOADS</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">LIGHTWEIGHT FUN</span></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {n:"01",icon:"🎮",title:"Play Games",desc:"Quick games to jump into and enjoy.",activities:"Tic-Tac-Toe · Memory Match",href:"/entertainment#play-games",c:"from-cyan-400/20 to-blue-500/5",accent:"text-cyan-200"},
              {n:"02",icon:"🔤",title:"Word Playground",desc:"Mix letters, spot words, and play with language.",activities:"Word Scramble · Hidden Words",href:"/entertainment#word-playground",c:"from-fuchsia-400/20 to-purple-500/5",accent:"text-fuchsia-200"},
              {n:"03",icon:"🧠",title:"Brain & Logic Lab",desc:"Put your reasoning and number skills to work.",activities:"Number Sequences · Logic",href:"/entertainment#brain-logic",c:"from-violet-400/20 to-indigo-500/5",accent:"text-violet-200"},
              {n:"04",icon:"🌍",title:"Quiz Arena",desc:"Take on questions about the world around you.",activities:"Science · Nature · Geography",href:"/entertainment#quiz-arena",c:"from-emerald-400/20 to-teal-500/5",accent:"text-emerald-200"},
              {n:"05",icon:"💡",title:"Riddle Corner",desc:"Crack clever clues and tricky little mysteries.",activities:"Riddles · Brain Teasers",href:"/entertainment#riddle-corner",c:"from-amber-300/20 to-orange-500/5",accent:"text-amber-200"},
              {n:"06",icon:"🏆",title:"Daily Challenge",desc:"Give your brain a fresh challenge to solve.",activities:"Daily Puzzle · Daily Quiz",href:"/entertainment#daily-challenge",c:"from-rose-400/20 to-pink-500/5",accent:"text-rose-200"},
              {n:"07",icon:"👀",title:"Memory & Observation",desc:"Notice details, remember patterns, match pairs.",activities:"Memory Match · Observation",href:"/entertainment#memory-observation",c:"from-sky-400/20 to-cyan-500/5",accent:"text-sky-200"},
              {n:"08",icon:"📚",title:"Explore Flipbooks",desc:"Travel through stories and languages in a few taps.",activities:"Short Reads · World Languages",href:"/bookShelf",c:"from-yellow-300/20 to-amber-500/5",accent:"text-yellow-200"}
            ].map((item) => (
              <Link key={item.n} href={item.href} prefetch={item.href==="/bookShelf"?undefined:false} className={`group relative flex min-h-[235px] flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${item.c} p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_22px_55px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:p-6`}>
                <span className="absolute right-5 top-4 text-xs font-black tracking-[0.2em] not-italic text-white/35">{item.n}</span>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl shadow-inner transition duration-300 group-hover:scale-110 group-hover:rotate-2" aria-hidden="true">{item.icon}</span>
                <h3 className={`mt-5 text-xl font-black not-italic tracking-tight text-white sm:text-2xl ${item.accent}`}>{item.title}</h3>
                <p className="mt-2 text-sm not-italic leading-6 text-slate-300">{item.desc}</p>
                <p className="mt-4 text-[11px] font-bold not-italic leading-5 text-white/55">{item.activities}</p>
                <span className="mt-auto pt-4 text-sm font-extrabold not-italic text-white">Explore section <span className="inline-block transition-transform group-hover:translate-x-1">↗</span></span>
              </Link>
            ))}
          </div>
          <div className="mt-9 text-center"><Link href="/entertainment" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-cyan-200/40 bg-gradient-to-r from-cyan-300 to-sky-300 px-7 py-3 text-sm font-black not-italic text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.2)] transition hover:scale-[1.03] hover:shadow-[0_12px_38px_rgba(34,211,238,0.32)]">Enter the Entertainment Hub <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>
      <div><AuthorApplicationBanner /></div>
      <section className="bg-white px-4 py-12 sm:py-16">
        <style>{`@keyframes shoppersOceanSeoZoom { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }`}</style>
        <div className="mx-auto max-w-4xl text-center" style={{ animation: "shoppersOceanSeoZoom 5s ease-out both" }}>
          <h2 className="mb-5 font-serif text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
            Discover E-books Online in Multiple Languages
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Welcome to Shoppers Ocean, your destination for discovering and reading e-books online. Explore fascinating stories in many languages of the world, discover books by independent authors, and enjoy a world of reading in one place.
          </p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-800">Trending Books</h2>
          <div><TrendingBooks loggedinUserId={user?.id} initialBooks={homepageBooks} /></div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Books in International Languages</h2>
          <p className="text-xl text-center mb-12 text-slate-600">Explore stories and ideas from authors around the world, in languages that bring every culture closer.</p>
          <BooksCollections loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"><TestimonialSection /></div>
      </section>
      <section className="bg-white py-8 sm:py-10">
        <div className="container mx-auto px-4 text-center">
          <Link href="/author-policies" className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
            Author Policies
          </Link>
        </div>
      </section>
      <section className="py-20 bg-white"><ContactForm user={user} /></section>
      <Footer />
    </div>
  )
}
