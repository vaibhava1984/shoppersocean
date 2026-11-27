import Link from "next/link";
import { getCurrentUser } from "@/utils/auth/session";
import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'
import ContactForm from './components/ContactForm';
import AuthorApplicationBanner from './components/AuthorApplicationBanner';
import TestimonialSection from './components/TestimonialSection';
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import HeroSection from "@/components/HeroSection";
import HomepageCategoryNavigation from "@/components/HomepageCategoryNavigation";
import TrendingBooks from "@/components/trending_books";
import BooksCollections from "@/components/books_collections";
import { getHomepageBooksServer } from "@/utils/homepageBooksServer";
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureSubscriptionSchema } from "@/utils/subscriptions/schema";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shoppers Ocean | Digital Flipbooks, Games, Quizzes & Learning',
  description: 'Discover interactive multilingual digital flipbooks, online games, quizzes, educational activities and brain challenges on Shoppers Ocean.',
  openGraph: {
    type: 'website',
    url: 'https://shoppersocean.com',
    siteName: 'Shoppers Ocean',
    title: 'Shoppers Ocean | Digital Flipbooks, Games, Quizzes & Learning',
    description: 'Read interactive multilingual flipbooks, play online games, explore quizzes and enjoy learning activities on Shoppers Ocean.',
    images: [{ url: 'https://shoppersocean.com/homepage_hero%20(1).jpeg', width: 1200, height: 630, alt: 'Shoppers Ocean — Digital Flipbooks, Games, Quizzes & Learning' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shoppers Ocean — Play, Think, Discover & Read',
    description: 'One Destination. Endless Ways to Enjoy.',
    images: ['https://shoppersocean.com/homepage_hero%20(1).jpeg'],
  },
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.publicMetadata?.userrole === "ADMIN";
  let isSubscribed = false;
  const db = getD1();
  if (user?.id) {
    try {
      if (db) {
        await ensureSubscriptionSchema(db);
        const subscription = await db.prepare("SELECT status, expires_at, payment_id FROM user_subscriptions WHERE user_id = ? LIMIT 1").bind(user.id).first<any>();
        isSubscribed = Boolean(subscription?.payment_id) && String(subscription?.status || "").toLowerCase() === "active" && Boolean(subscription?.expires_at) && new Date(String(subscription.expires_at)).getTime() > Date.now();
      }
    } catch (error) { console.error("Could not check homepage subscription status:", error); }
  }
  const [homepageBooks, authorsResult, languageRowsResult] = await Promise.all([
    getHomepageBooksServer(),
    db ? db.prepare("SELECT id AS author_id,name FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name ASC").all<{author_id:string;name:string}>() : Promise.resolve({ results: [] as {author_id:string;name:string}[] }),
    db ? db.prepare("SELECT language FROM books WHERE COALESCE(is_deleted,0)=0 AND language IS NOT NULL").all<{language:string}>() : Promise.resolve({ results: [] as {language:string}[] }),
  ]);
  const authors = authorsResult.results ?? [];
  const languages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...(languageRowsResult.results ?? []).map((row) => row.language).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <div>
        <HeroSection
          title="Shoppers Ocean"
          subtitle="One Destination. Endless Ways to Enjoy."
          welcomeName={user?.firstName || undefined}
          isAdmin={isAdmin}
          isAuthor={Boolean(user?.publicMetadata?.isAuthor) && !isAdmin}
          isSubscribed={isSubscribed}
          buttonText="Explore Flipbooks"
          buttonLink="/bookShelf"
          imageSrc="/homepage_hero%20(1).jpeg"
          imageAlt="Shoppers Ocean featured hero image"
        />
      </div>

      <section className="relative overflow-hidden border-y border-indigo-800 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-8 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-black tracking-tight text-white sm:text-4xl">Explore Our World of Flipbooks</h2>
          <HomepageCategoryNavigation authors={authors} languages={languages} />
        </div>
      </section>
      <section id="trending-books" className="scroll-mt-24 bg-white py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-2xl font-black text-slate-800 sm:text-3xl">Trending Books</h2>
          <TrendingBooks loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>
      <section id="international-books" className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-cyan-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-2xl font-black text-slate-800 sm:text-3xl">Books in International Languages</h2>
          <BooksCollections loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>

      <div><AuthorApplicationBanner /></div>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"><TestimonialSection /></div>
      </section>
      <section className="py-20 bg-white"><ContactForm user={user} /></section>
      <Footer />
    </div>
  )
}
