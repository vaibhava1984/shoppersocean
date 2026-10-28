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
import EntertainmentHub from "@/components/EntertainmentHub";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shoppers Ocean | Play, Think, Discover & Read',
  description: 'Play lightweight browser games, solve quizzes and brain challenges, take daily challenges, and discover digital flipbooks in multiple languages at Shoppers Ocean.',
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <div>
        <HeroSection
          title="Shoppers Ocean"
          subtitle="Play. Connect. Compete. Your Next Favourite Escape Starts Here."
          welcomeName={user?.firstName || undefined}
          isAdmin={user?.publicMetadata?.userrole === "ADMIN"}
          isAuthor={Boolean(user?.publicMetadata?.isAuthor) && user?.publicMetadata?.userrole !== "ADMIN"}
          buttonText="Explore Flipbooks"
          buttonLink="/bookShelf"
          imageSrc="/1.jpg?rev=2"
          imageAlt="Shoppers Ocean featured hero image"
        />
      </div>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"><EntertainmentHub userId={user?.id ?? null} /></div>
      </section>

      <section className="relative overflow-hidden border-y border-blue-100 bg-gradient-to-r from-white via-blue-50 to-cyan-50 py-10 sm:py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-5 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">A little more to discover</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-800 sm:text-3xl">Explore the World of Flipbooks</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Take a break from the games and discover stories and digital books from authors across languages.</p>
          </div>
          <Link href="/bookShelf" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Explore Flipbooks <span className="ml-2" aria-hidden="true">→</span></Link>
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
