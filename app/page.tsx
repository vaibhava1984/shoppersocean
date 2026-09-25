import { getUser } from "@/utils/db/server";
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
import { createClient } from "@/utils/db/server";

export const metadata = {
  title: 'Home',
  description: 'Homepage',
}

export default async function LandingPage() {
  const supabase = createClient();
  const [user, homepageBooks, authorsResult, languageRowsResult] = await Promise.all([
    getUser(),
    getHomepageBooksServer(),
    supabase.from("authors").select("author_id,name").eq("is_deleted", false).order("name", { ascending: true }),
    supabase.from("books").select("language").eq("is_deleted", false).not("language", "is", null),
  ]);
  const authors = authorsResult.data ?? [];
  const languages = Array.from(new Set((languageRowsResult.data ?? []).map((row) => row.language).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} categoryNavigation={{ authors, languages }} />
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