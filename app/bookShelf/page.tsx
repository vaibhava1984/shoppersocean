import Header from "@/components/Header"
import { getCurrentUser } from "@/utils/auth/session"
import { getD1 } from "@/utils/cloudflare/d1"
import Footer from "@/components/Footer"
import BookCard from "@/components/BookCard"
import CategoryFilterButtons from "@/components/CategoryFilterButtons"
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Your Books",
    description: "Books you have purchased",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

type ShelfSearchParams = {
    genre?: string
    author?: string
    lang?: string
    source?: string
}

export default async function BookShelfPage({
    searchParams,
}: {
    searchParams?: Promise<ShelfSearchParams>
}) {
    const params = (await searchParams) ?? {}
    const genre = params.genre?.trim() ?? ""
    const author = params.author?.trim() ?? ""
    const language = params.lang?.trim() ?? ""
    const isCategoryBrowse = Boolean(genre || author || language)

    const user = await getCurrentUser()
    // Your Books is a signed-in account page; category browsing remains available
    // to signed-in and signed-out visitors.
    if (!user && !isCategoryBrowse) redirect("/login")

    const isAdmin = String(user?.publicMetadata?.userrole ?? "").trim().toUpperCase() === "ADMIN"
    const db = getD1()
    if (!db) throw new Error("Cloudflare D1 is not available")

    let books: Record<string, any>[] = []
    let availableLanguages = [...SUPPORTED_BOOK_LANGUAGES]

    if (isCategoryBrowse) {
        const languageResult = await db.prepare("SELECT DISTINCT language FROM books WHERE COALESCE(is_deleted, 0) = 0 AND language IS NOT NULL AND TRIM(language) != ''").all<{ language: string }>()
        availableLanguages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...(languageResult.results ?? []).map((row) => row.language.trim()).filter(Boolean)])).sort((a, b) => a.localeCompare(b))
        const conditions = ["COALESCE(b.is_deleted, 0) = 0"]
        const bindings: string[] = []
        if (genre) {
            conditions.push("b.genre = ?")
            bindings.push(genre)
        }
        if (author) {
            conditions.push("b.author_id = ?")
            bindings.push(author)
        }
        if (language) {
            conditions.push("b.language = ?")
            bindings.push(language)
        }

        const result = await db.prepare(
            `SELECT b.id, b.title, b.description, b.price, b.cover_images, b.author_name, b.genre, b.author_id, b.language
             FROM books b
             WHERE ${conditions.join(" AND ")}
             ORDER BY COALESCE(b.created_at, b.updated_at, b.published_date) DESC, b.title ASC`
        ).bind(...bindings).all<Record<string, any>>()

        books = (result.results ?? []).map((book) => {
            let images: string[] = []
            if (Array.isArray(book.cover_images)) images = book.cover_images
            else if (typeof book.cover_images === "string") {
                try {
                    const parsed = JSON.parse(book.cover_images)
                    images = Array.isArray(parsed) ? parsed : []
                } catch {}
            }
            return {
                ...book,
                id: String(book.id),
                description: book.description ?? "",
                price: Number(book.price ?? 0),
                coverImage: images[0],
                images,
                author: book.author_name,
            }
        })
    } else if (!isAdmin && user) {
        const result = await db.prepare(
            `SELECT b.id, b.title, b.description, b.price, b.cover_images, b.author_name, b.genre
             FROM books b
             JOIN (
               SELECT o.book_id, MAX(o.created_at) AS purchased_at
               FROM orders o
               LEFT JOIN payments p ON p.order_id = o.id
               WHERE o.user_id = ?
                 AND (o.status = 'completed' OR p.status = 'completed')
               GROUP BY o.book_id
             ) purchases ON purchases.book_id = b.id
             WHERE COALESCE(b.is_deleted, 0) = 0
             ORDER BY purchases.purchased_at DESC`
        ).bind(user.id).all<Record<string, any>>()

        books = (result.results ?? []).map((book) => {
            let images: string[] = []
            if (Array.isArray(book.cover_images)) images = book.cover_images
            else if (typeof book.cover_images === "string") {
                try {
                    const parsed = JSON.parse(book.cover_images)
                    images = Array.isArray(parsed) ? parsed : []
                } catch {}
            }
            return {
                ...book,
                id: String(book.id),
                description: book.description ?? "",
                price: Number(book.price ?? 0),
                coverImage: images[0],
                images,
                author: book.author_name,
            }
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="bg-white py-10 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {isCategoryBrowse ? (
                        <>
                            <CategoryFilterButtons genre={genre} author={author} language={language} languages={availableLanguages} />
                            <h1 className="mb-6 text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
                                {author ? `Books by Author${genre ? ` · Genre: ${genre}` : ""}${language ? ` · Language: ${language}` : ""}` : genre ? `Books by Genre: ${genre}${language ? ` · Language: ${language}` : ""}` : `Books in ${language}`}
                            </h1>
                            {books.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {books.map((book) => (
                                        <BookCard key={book.id} book={book} loggedinUserId={user?.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded border-2 border-dashed border-gray-300 py-12 text-center">
                                    <p role="status" aria-live="polite" className="mx-auto max-w-2xl px-4 text-lg leading-relaxed text-slate-600">Sorry !! For now we don't have anything as per your choice, but soon you will find your desired content ☺️</p>
                                </div>
                            )}
                        </>
                    ) : isAdmin ? (
                        <div className="py-16 text-center">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Ohh man !! You are the boss !! Every book is yours ☺️
                            </h1>
                        </div>
                    ) : (
                        <>
                            <h1 className="mb-8 text-2xl sm:text-3xl font-bold text-slate-800">Hi {String(user?.firstName ?? "").trim().split(/\s+/)[0] || "there"}, here are the books that you purchased. Read and enjoy ! ☺️</h1>
                            {books.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {books.map((book) => (
                                        <BookCard key={book.id} book={book} loggedinUserId={user?.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded border-2 border-dashed border-gray-300 py-12 text-center">
                                    <p className="text-lg text-slate-600">Uh oh ! 😯 You haven’t purchased any books so far !! Try one now !! ☺️</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    )
}
