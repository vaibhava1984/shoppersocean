import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'
import ContactForm from './components/ContactForm';
import AuthorApplicationBanner from './components/AuthorApplicationBanner';
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import TrendingBooks from "@/components/trending_books";
import BooksCollections from "@/components/books_collections";
import HeroSection from "@/components/HeroSection";
import TestimonialSection from "./components/TestimonialSection";

export const metadata = {
  title: 'Home',
  description: 'Homepage',
}

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
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
            <TrendingBooks loggedinUserId={user?.id} />
          </div>
        </div>
      </section>

      {/* Author's Book Collection Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Our Book Collection</h2>
          <p className="text-xl text-center mb-12 text-slate-600">Discover the captivating works of esteemed authors across the globe, known for their insightful and thought-provoking narratives.</p>
          <BooksCollections loggedinUserId={user?.id} />
        </div>
      </section>

      {/* Query Section */}
      <section className="py-20 bg-white">
        <ContactForm />
      </section>

      {/* Review Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-800">What Our Readers Say</h2>
          <TestimonialSection />
        </div>
      </section>
      <Footer />
    </div>
  )
}