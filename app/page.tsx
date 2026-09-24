import { currentUser } from "@clerk/nextjs/server";
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

export const metadata = {
  title: 'Home',
  description: 'Homepage',
}

export default async function LandingPage() {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");
  const user = await currentUser();
  const [homepageBooks, authorsResult, languageRowsResult] = await Promise.all([
    getHomepageBooksServer(),
    db.prepare("SELECT author_id,name FROM authors WHERE COALESCE(is_deleted, 0) = 0 ORDER BY name ASC").all<Record<string, any>>(),
    db.prepare("SELECT language FROM books WHERE COALESCE(is_deleted, 0) = 0 AND language IS NOT NULL").all<Record<string, any>>(),
  ]);
  const authors = authorsResult.results ?? [];
  const languages = Array.from(new Set(languageRowsResult.results.map((row) => row.language).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header categoryNavigation={{ authors, languages }} />
      <div>
        <HeroSection
          title="Shoppers Ocean"
          subtitle="Where every wave brings a new deal"
          buttonText=" Embark on Your Adventure"
          buttonLink="/bookShelf"
          imageSrc="/homepage_hero.jpeg"
          imageAlt=" Embark on Your Adventure"
        />
      </div>
      <div>
        <AuthorApplicationBanner />
      </div>

      {/* Trending Books Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-800">Trending Books</h2>
          <div>
            <TrendingBooks loggedinUserId={user?.id} initialBooks={homepageBooks} />
          </div>
        </div>
      </section>

      {/* Books Collection Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Our Book Collection</h2>
          <p className="text-xl text-center mb-12 text-slate-600">Discover the captivating works of esteemed authors across the globe, known for their insightful and thought-provoking narratives.</p>
          <BooksCollections loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>

      {/* Testimonials and account controls */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TestimonialSection user={user} />
        </div>
      </section>

      {/* Query Section */}
      <section className="py-20 bg-white">
        <ContactForm />
      </section>
      <Footer />
    </div>
  )
}