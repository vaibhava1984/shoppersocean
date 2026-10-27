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
import EntertainmentHub from "@/components/EntertainmentHub";
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
          subtitle="One World. Many Languages. Endless Flipbooks."
          welcomeName={user?.firstName || undefined}
          isAdmin={user?.publicMetadata?.userrole === "ADMIN"}
          isAuthor={Boolean(user?.publicMetadata?.isAuthor) && user?.publicMetadata?.userrole !== "ADMIN"}
          buttonText=" Embark on Your Adventure"
          buttonLink="/bookShelf"
          imageSrc="/homepage_hero (1).jpeg"
          imageAlt=" Embark on Your Adventure"
        />
      </div>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#07152e] via-[#123d70] to-[#087e8c] py-14 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-16 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] not-italic text-cyan-100 shadow-sm backdrop-blur">✦ The fun starts here</span>
            <h2 className="mt-5 font-serif text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">Play. Think. <span className="text-cyan-200">Discover.</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-50/85 sm:text-lg">Eight colourful worlds. Quick games, clever puzzles, quizzes and daily challenges. Pick one to open it—everything else gets out of your way.</p>
          </div>
          <EntertainmentHub />
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
