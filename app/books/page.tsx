import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { getD1 } from "@/utils/cloudflare/d1";

export const metadata: Metadata = {
  title: "Discover E-books Online in Multiple Languages | Shoppers Ocean",
  description:
    "Explore the Shoppers Ocean catalogue of e-books in multiple languages. Discover books by title, author, genre, and language, and open each book's public details page.",
  alternates: { canonical: "https://shoppersocean.com/books" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default async function PublicBooksPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const params = await searchParams;
  const selectedLanguage = String(params.language ?? "").trim();
  const db = getD1();
  let books: Record<string, any>[] = [];

  if (db) {
    const result = await db
      .prepare(
        `SELECT id, title, description, price, cover_images, author_name, genre, language
         FROM books
         WHERE COALESCE(is_deleted, 0) = 0 AND id IS NOT NULL
         ORDER BY COALESCE(created_at, updated_at, published_date) DESC, title ASC`
      )
      .all<Record<string, any>>();

    books = (result.results ?? []).map((book) => {
      const images = parseImages(book.cover_images);
      return {
        ...book,
        id: String(book.id),
        title: String(book.title ?? "Untitled book"),
        description: String(book.description ?? ""),
        price: Number(book.price ?? 0),
        coverImage: images[0],
        images,
        author: book.author_name,
      };
    });
  }

  const languages = Array.from(new Set(books.map((book) => String(book.language ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const catalogueBooks = selectedLanguage ? books.filter((book) => String(book.language ?? "").trim().toLowerCase() === selectedLanguage.toLowerCase()) : books;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>
        <section className="bg-white py-10 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="mb-4 text-2xl font-bold leading-snug text-slate-900 sm:text-4xl">
              Discover E-books Online in Multiple Languages
            </h1>
            <p className="mb-8 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Explore books published on Shoppers Ocean. Open any book to view its details, author, language, and available reading or purchase options.
            </p>
            {books.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-slate-500">{catalogueBooks.length} {catalogueBooks.length === 1 ? "book" : "books"} in the catalogue</p>
                <form action="/books" method="get" className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 sm:flex-row sm:items-center sm:p-4">
                  <label htmlFor="catalogue-language" className="shrink-0 text-sm font-semibold text-slate-800">Choose your language</label>
                  <select id="catalogue-language" name="language" defaultValue={selectedLanguage} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="">All languages</option>
                    {languages.map((language) => <option key={language} value={language}>{language}</option>)}
                  </select>
                  <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Show books</button>
                </form>
                {catalogueBooks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {catalogueBooks.map((book) => <BookCard key={book.id} book={book} />)}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">No books are currently available in {selectedLanguage}. Please choose another language.</p>
                )}
              </>
            ) : (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-600">
                The catalogue is temporarily unavailable. Please try again soon.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
