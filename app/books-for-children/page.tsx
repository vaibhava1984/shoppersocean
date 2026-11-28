import Link from "next/link"
import { getD1 } from "@/utils/cloudflare/d1"
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages"

export const dynamic = "force-dynamic"

export default async function BooksForChildrenPage() {
  const db = getD1()
  if (!db) throw new Error("Cloudflare D1 is not available")

  const result = await db.prepare(
    "SELECT DISTINCT language FROM books WHERE COALESCE(is_deleted,0)=0 AND genre=? AND language IS NOT NULL AND TRIM(language)<>''"
  ).bind("Books for Children").all<{ language: string }>()

  const languages = Array.from(new Set([
    ...SUPPORTED_BOOK_LANGUAGES,
    ...(result.results ?? []).map((row) => row.language).filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b))

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
          ← Home
        </Link>
        <header className="mb-8 rounded-2xl border border-blue-100 bg-white/90 p-6 text-center shadow-lg sm:p-9">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">Little readers, big adventures</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Books for Children</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose a language to explore children’s books. Languages with new children’s books will appear here automatically.
          </p>
        </header>
        <section aria-label="Children's books by language" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {languages.map((language) => (
            <Link
              key={language}
              href={`/bookShelf?genre=${encodeURIComponent("Books for Children")}&lang=${encodeURIComponent(language)}&source=homepage`}
              className="group flex min-h-20 items-center justify-center rounded-xl border border-blue-100 bg-white px-3 py-4 text-center text-base font-extrabold tracking-wide text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-600 hover:text-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-lg"
            >
              {language}
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
