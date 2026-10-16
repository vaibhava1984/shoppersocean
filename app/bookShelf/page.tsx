import Header from "@/components/Header"
import { getCurrentUser } from "@/utils/auth/session"
import { getD1 } from "@/utils/cloudflare/d1"
import Footer from "@/components/Footer"
import BookCard from "@/components/BookCard"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Your Books",
    description: "Books you have purchased",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function BookShelfPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    const isAdmin = String(user.publicMetadata.userrole ?? "").trim().toUpperCase() === "ADMIN"
    const db = getD1()
    if (!db) throw new Error("Cloudflare D1 is not available")

    let books: Record<string, any>[] = []
    if (!isAdmin) {
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
            return { ...book, coverImage: images[0], images, author: book.author_name }
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="bg-white py-10 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {isAdmin ? (
                        <div className="py-16 text-center">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Ohh man !! You are the boss !! Every book is yours ☺️
                            </h1>
                        </div>
                    ) : (
                        <>
                            <h1 className="mb-8 text-3xl font-bold text-slate-800">Your Books</h1>
                            {books.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {books.map((book) => (
                                        <BookCard key={book.id} book={book} loggedinUserId={user.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded border-2 border-dashed border-gray-300 py-12 text-center">
                                    <p className="text-lg text-slate-600">You haven’t purchased any books yet.</p>
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
