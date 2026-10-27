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
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-cyan-50 py-14 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-11">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] not-italic text-blue-700 shadow-sm">✦ Something for Everyone</span>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-slate-800 sm:text-4xl lg:text-5xl">Explore, Play & <span className="text-blue-700">Challenge Yourself</span></h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Take a little break with fun games, word puzzles, quizzes and brain teasers—then discover your next favourite flipbook.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {n:"01",icon:"🎮",title:"Play Games",desc:"Enjoy quick games whenever you have a moment.",activities:"Tic-Tac-Toe · Rock, Paper, Scissors",href:"/entertainment#play-games",tone:"border-blue-100",iconTone:"bg-blue-50 text-blue-700"},
              {n:"02",icon:"🔤",title:"Word Playground",desc:"Unscramble letters and discover hidden words.",activities:"Word Scramble · Missing Letter",href:"/entertainment#word-playground",tone:"border-fuchsia-100",iconTone:"bg-fuchsia-50 text-fuchsia-700"},
              {n:"03",icon:"🧠",title:"Brain & Logic Lab",desc:"Put your reasoning and number skills to work.",activities:"Number Sequences · Logic Puzzles",href:"/entertainment#brain-logic",tone:"border-violet-100",iconTone:"bg-violet-50 text-violet-700"},
              {n:"04",icon:"🌍",title:"Quiz Arena",desc:"Test what you know about the world around you.",activities:"Science · Nature · Geography",href:"/entertainment#quiz-arena",tone:"border-emerald-100",iconTone:"bg-emerald-50 text-emerald-700"},
              {n:"05",icon:"💡",title:"Riddle Corner",desc:"Crack clever clues and tricky little mysteries.",activities:"Riddles · Brain Teasers",href:"/entertainment#riddle-corner",tone:"border-amber-100",iconTone:"bg-amber-50 text-amber-700"},
              {n:"06",icon:"🏆",title:"Daily Challenge",desc:"Give your mind a fresh challenge to solve.",activities:"Daily Puzzle · Brain Teaser",href:"/entertainment#daily-challenge",tone:"border-rose-100",iconTone:"bg-rose-50 text-rose-700"},
              {n:"07",icon:"👀",title:"Memory & Observation",desc:"Notice details, remember patterns and match pairs.",activities:"Memory Match · Sequence Recall",href:"/entertainment#memory-observation",tone:"border-cyan-100",iconTone:"bg-cyan-50 text-cyan-700"},
              {n:"08",icon:"📚",title:"Explore Flipbooks",desc:"Travel through stories and languages in a few taps.",activities:"Short Reads · World Languages",href:"/bookShelf",tone:"border-sky-100",iconTone:"bg-sky-50 text-sky-700"}
            ].map((item) => (
              <Link key={item.n} href={item.href} prefetch={item.href==="/bookShelf"?undefined:false} className={`group relative flex min-h-[224px] flex-col overflow-hidden rounded-2xl border ${item.tone} bg-white p-5 shadow-[0_5px_22px_rgba(30,64,175,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_14px_32px_rgba(30,64,175,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-6`}>
                <span className="absolute right-5 top-4 text-xs font-extrabold tracking-widest not-italic text-slate-300">{item.n}</span>
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconTone} text-3xl transition duration-300 group-hover:scale-110`} aria-hidden="true">{item.icon}</span>
                <h3 className="mt-4 text-xl font-bold not-italic tracking-tight text-slate-800">{item.title}</h3>
                <p className="mt-2 text-sm not-italic leading-6 text-slate-600">{item.desc}</p>
                <p className="mt-3 text-[11px] font-bold not-italic leading-5 text-slate-500">{item.activities}</p>
                <span className="mt-auto pt-4 text-sm font-extrabold not-italic text-blue-700">Explore section <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center"><Link href="/entertainment" prefetch={false} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-blue-600 px-7 py-3 text-sm font-bold not-italic text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg">Explore All Entertainment <span aria-hidden="true">→</span></Link></div>
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
