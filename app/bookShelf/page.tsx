import Header from "@/components/Header"
import { currentUser } from "@clerk/nextjs/server"
import { getD1 } from "@/utils/cloudflare/d1"
import CategoriesAccordion from "@/app/components/CategoriesAccordion"
import { Card, CardContent } from "@/components/ui/card"
import Footer from "@/components/Footer"
import BookCard from "@/components/BookCard"
import HeroSection from "@/components/HeroSection"
import AuthorApplicationBanner from "@/app/components/AuthorApplicationBanner"

export const metadata = {
    title: "BookShelf",
    description: "Escape into Entertainment",
}

export const revalidate = 3600
export const dynamicParams = true

type BookShelfSearchParams = {
    lang?: string
    author?: string
    genre?: string
    source?: string
}

export default async function BookShelfPage({
    searchParams,
}: {
    searchParams: Promise<BookShelfSearchParams>
}) {
    const params = await searchParams
    const languageParam = params?.lang ?? "all"
    const authorParam = params?.author ?? "all"
    const genreParam = params?.genre ?? "all"
    const sourceParam = params?.source ?? null
    const showCategoryButtons = sourceParam !== "homepage"

    const languageMap: Record<string, string> = {
        en: "English",
        hindi: "Hindi",
    }

    const language = languageMap[languageParam] ?? (languageParam !== "all" ? languageParam : undefined)
    const db = getD1()
    if (!db) throw new Error("Cloudflare D1 is not available")
    const user = await currentUser()

    let bookSql = "SELECT id,title,description,price,cover_images,author_name,genre FROM books WHERE COALESCE(is_deleted, 0) = 0"
    const bookParams: unknown[] = []
    if (language) { bookSql += " AND language = ?"; bookParams.push(language) }
    if (authorParam !== "all") { bookSql += " AND author_id = ?"; bookParams.push(authorParam) }
    if (genreParam !== "all") { bookSql += " AND genre = ?"; bookParams.push(genreParam) }
    bookSql += " ORDER BY title ASC LIMIT 100"

    const [booksResult, authorsResult, languageRowsResult] = await Promise.all([
        db.prepare(bookSql).bind(...bookParams).all<Record<string, any>>(),
        db.prepare("SELECT author_id,name FROM authors WHERE COALESCE(is_deleted, 0) = 0 ORDER BY name ASC").all<Record<string, any>>(),
        db.prepare("SELECT language FROM books WHERE COALESCE(is_deleted, 0) = 0 AND language IS NOT NULL").all<Record<string, any>>(),
    ])

    const books = booksResult.results ?? []
    const authors = authorsResult.results ?? []
    const languages = Array.from(new Set(languageRowsResult.results.map((row) => row.language).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)))

    const filteredBooks = books.map((book) => {
        let images: string[] = []
        if (Array.isArray(book.cover_images)) images = book.cover_images
        else if (typeof book.cover_images === "string") { try { const parsed = JSON.parse(book.cover_images); images = Array.isArray(parsed) ? parsed : [] } catch {} }
        return { ...book, coverImage: images[0], images, author: book.author_name }
    })

    const authorInfo = {
        "Chetan Bhagat": "Chetan Bhagat is the author of seven blockbuster books. These include six novels—Five Point Someone (2004), One Night @ the Call Center (2005), The 3 Mistakes of My Life (2008), 2 States (2009), Revolution 2020 (2011), Half Girlfriend (2014), and One Indian Girl (2016). His non-fiction works include What Young India Wants (2012) and India Positive (2019).",
        "Amish Tripathi": "Amish Tripathi is an Indian author known for his novels The Shiva Trilogy and the Ram Chandra Series. His debut work, The Immortals of Meluha, was a bestseller that earned him the Crossword Book Award and the Raymond Crossword Book Award.",
        "Sudha Murty": "Sudha Murty is an Indian engineering teacher, author and social worker. She is the chairperson of the Infosys Foundation and a member of public health care initiatives of the Government of Karnataka.",
    }

    const selectedAuthorName =
        authorParam !== "all" ? filteredBooks[0]?.author : null
    const selectedAuthorInfo = selectedAuthorName
        ? authorInfo[selectedAuthorName as keyof typeof authorInfo]
        : null

    function getPageHeader() {
        if (languageParam === "en") return "English Books"
        if (languageParam === "hindi") return "Hindi Books"
        if (genreParam !== "all") return `${genreParam} Books`
        return "All Books"
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header categoryNavigation={{ authors, languages }} />
            <HeroSection
                title=" Escape into Entertainment"
                subtitle="Discover your next favorite book"
                imageSrc="/bookshelf_hero_image.jpeg"
                imageAlt=" Embark on Your Adventure"
            />
            <AuthorApplicationBanner />

            <section className="bg-white py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {showCategoryButtons && (
                            <div className="md:w-1/4">
                                <h2 className="mb-5 text-3xl font-black text-black">Categories</h2>
                                <CategoriesAccordion
                                    authors={authors}
                                    languages={languages}
                                    currentAuthor={authorParam}
                                    currentLanguage={languageParam}
                                    currentGenre={genreParam}
                                />
                            </div>
                        )}

                        <div className={showCategoryButtons ? "md:w-3/4" : "w-full"}>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-3xl font-bold text-slate-800">{getPageHeader()}</h2>
                            </div>

                            {selectedAuthorInfo && filteredBooks.length > 0 && (
                                <Card className="mb-8">
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-2xl font-bold text-slate-800">{selectedAuthorName}</h3>
                                        <p className="whitespace-pre-line text-slate-600">{selectedAuthorInfo}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredBooks.map((book) => (
                                        <BookCard key={book.id} book={book} loggedinUserId={user?.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded border-2 border-dashed border-gray-300 py-12 text-center">
                                    <p className="text-lg text-slate-600">No books found matching your criteria.</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {languageParam !== "all" && `Language: ${languageParam}`}
                                        {languageParam !== "all" && authorParam !== "all" && " | "}
                                        {authorParam !== "all" && `Author: ${authorParam}`}
                                        {genreParam !== "all" && " | "}
                                        {genreParam !== "all" && `Genre: ${genreParam}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
