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

export default async function PublicBooksPage() {
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
                <p className="mb-6 text-sm text-slate-500">{books.length} books in the catalogue</p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
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
