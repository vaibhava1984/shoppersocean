import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomepageCategoryNavigation from "@/components/HomepageCategoryNavigation";
import TrendingBooks from "@/components/trending_books";
import BooksCollections from "@/components/books_collections";
import { getHomepageBooksServer } from "@/utils/homepageBooksServer";
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Read E-books | Shoppers Ocean",
  description: "Explore e-books by genre, author, language, trending stories, and international collections on Shoppers Ocean.",
};

export default async function ReadEbooksPage() {
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
      <Header user={user} />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#07152e] via-[#123d70] to-[#087e8c] py-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] not-italic text-cyan-200">Shoppers Ocean · A world of stories</p>
          <h1 className="mt-3 font-serif text-3xl font-black tracking-tight text-white sm:text-5xl">Read E-books</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-50/90 sm:text-lg">Choose a genre, discover an author, select your language, or explore trending and international stories.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#trending-books" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold not-italic text-white backdrop-blur transition hover:bg-white/20">Trending Books ↓</a>
            <a href="#international-books" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold not-italic text-white backdrop-blur transition hover:bg-white/20">International Languages ↓</a>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-7 sm:py-9">
        <div className="mx-auto max-w-5xl text-center">
          <HomepageCategoryNavigation authors={authors} languages={languages} />
          <h2 className="font-serif text-2xl font-black text-slate-800 sm:text-3xl">Find Your Next Read</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Use the book buttons above to browse by genre, author, or language.</p>
        </div>
      </section>
      <section id="trending-books" className="scroll-mt-32 bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-serif text-2xl font-black text-slate-800 sm:mb-10 sm:text-3xl">Trending Books</h2>
          <TrendingBooks loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>
      <section id="international-books" className="scroll-mt-32 bg-gradient-to-br from-blue-50 to-cyan-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-center font-serif text-2xl font-black text-slate-800 sm:text-3xl">Books in International Languages</h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-7 text-slate-600">Explore stories and ideas from authors around the world, in languages that bring every culture closer.</p>
          <BooksCollections loggedinUserId={user?.id} initialBooks={homepageBooks} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
