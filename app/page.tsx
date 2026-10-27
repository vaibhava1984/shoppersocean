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
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] not-italic text-blue-700">Shoppers Ocean Entertainment</p>
            <h2 className="mt-2 text-3xl font-black not-italic text-slate-900 sm:text-4xl">Your World of Entertainment</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base not-italic text-slate-600 sm:text-lg">Play, think, challenge yourself, and discover stories from around the world.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎮", title: "Play Games", description: "Free, quick browser games.", href: "/entertainment#play-games" },
              { icon: "🧠", title: "Quizzes & Brain Challenges", description: "Test your knowledge and logic.", href: "/entertainment#brain-challenges" },
              { icon: "🏆", title: "Daily Challenge", description: "Try a brain teaser.", href: "/entertainment#daily-challenge" },
              { icon: "📚", title: "Explore Flipbooks", description: "Read stories in many languages.", href: "/bookShelf" },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
                <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                <h3 className="mt-3 text-lg font-extrabold not-italic text-slate-900 group-hover:text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm not-italic leading-relaxed text-slate-600">{item.description}</p>
                <span className="mt-4 inline-block text-sm font-bold not-italic text-blue-700">Explore →</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center"><Link href="/entertainment" className="inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold not-italic text-white shadow-sm hover:bg-blue-700">Open Entertainment Hub</Link></div>
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
