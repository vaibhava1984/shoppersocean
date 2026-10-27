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
  title: 'Read Digital Flipbooks & E-books in Multiple Languages',
  description: 'Discover digital flipbooks and e-books in multiple languages at Shoppers Ocean. Explore stories from independent authors, browse books by language, and enjoy reading from around the world.',
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <div>
        <HeroSection
          title="Shoppers Ocean"
          subtitle="Play Bold. Think Deeper. Discover More."
          welcomeName={user?.firstName || undefined}
          isAdmin={user?.publicMetadata?.userrole === "ADMIN"}
          isAuthor={Boolean(user?.publicMetadata?.isAuthor) && user?.publicMetadata?.userrole !== "ADMIN"}
          buttonText=" Embark on Your Adventure"
          buttonLink="/bookShelf"
          imageSrc="https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=85"
          imageAlt="Vibrant digital entertainment and interactive experiences"
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"><TestimonialSection /></div>
      </section>
      <section className="py-20 bg-white"><ContactForm user={user} /></section>
      <Footer />
    </div>
  )
}
