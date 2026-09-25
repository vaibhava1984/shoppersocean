import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";
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
import type { User } from "firebase/auth";

export const metadata = {
  title: 'Home',
  description: 'Homepage',
}

export default async function LandingPage() {
  const firebaseUser: any = await getFirebaseUser();
  const [homepageBooks, authorsSnap, languageSnap] = await Promise.all([
    getHomepageBooksServer(),
    firestore.collection("authors").where("is_deleted", "==", false).orderBy("name").get(),
    firestore.collection("books").where("is_deleted", "==", false).get(),
  ]);
  const authors = authorsSnap.docs.map(d => ({ author_id: String(d.data()?.author_id ?? d.id), name: String(d.data()?.name ?? "") }));
  const languages = Array.from(new Set(languageSnap.docs.map(d => d.data()?.language).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  const user = firebaseUser ? ({
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
    displayName: firebaseUser.name ?? null,
    emailVerified: Boolean(firebaseUser.email_verified),
  } as User) : null;
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-800">Trending Books</h2>
          <div>
            <TrendingBooks loggedinUserId={user?.uid} initialBooks={homepageBooks} />
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BooksCollections loggedinUserId={user?.uid} initialBooks={homepageBooks} />
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TestimonialSection user={user} />
        </div>
      </section>
      <section className="py-20 bg-white">
        <ContactForm />
      </section>
      <Footer />
    </div>
  )
}
