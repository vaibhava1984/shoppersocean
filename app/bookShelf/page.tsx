import Link from "next/link"
import Header from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import LanguageMenusLists from "@/app/components/LanguageMenusLists"
import AuthorsMenusLists from "@/app/components/AuthorsMenusLists"
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
}

export default async function BookShelfPage({
    searchParams,
}: {
    searchParams: Promise<BookShelfSearchParams>
}) {
    const params = await searchParams
    const searchFilters = {
        language: params?.lang ?? "all",
        author_id: params?.author ?? "all",
    }

    const supabase = createClient()

    const booksPromise = (() => {
        let query = supabase
            .from("books")
            .select("id,title,language,author_id,author_name,description,price,cover_images")
            .eq("is_deleted", false)
            .limit(100)
            .order("title", { ascending: true })

        if (searchFilters.language !== "all") {
            const languageMap: Record<string, string> = {
                en: "English",
                hindi: "Hindi",
            }
            const language = languageMap[searchFilters.language]
            if (language) query = query.eq("language", language)
        }

        if (searchFilters.author_id !== "all" && searchFilters.author_id.length > 0) {
            query = query.eq("author_id", searchFilters.author_id)
        }

        return query
    })()

    const authorsPromise = supabase
        .from("authors")
        .select("author_id,name")
        .eq("is_deleted", false)
        .order("name", { ascending: true })

    // Load independent data together, but don't let one failed request take down the whole page.
    const [userResult, booksResult, authorsResult] = await Promise.allSettled([
        supabase.auth.getUser(),
        booksPromise,
        authorsPromise,
    ])

    const user =
        userResult.status === "fulfilled" ? userResult.value.data.user : null

    const booksResponse =
        booksResult.status === "fulfilled" ? booksResult.value : null

    const authorsResponse =
        authorsResult.status === "fulfilled" ? authorsResult.value : null

    if (userResult.status === "rejected") {
        console.error("[BookShelf] User lookup failed:", userResult.reason)
    }

    if (booksResult.status === "rejected") {
        console.error("[BookShelf] Books request failed:", booksResult.reason)
    } else if (booksResponse?.error) {
        console.error("[BookShelf] Error fetching books:", {
            error: booksResponse.error.message,
            filters: searchFilters,
        })
    }

    if (authorsResult.status === "rejected") {
        console.error("[BookShelf] Authors request failed:", authorsResult.reason)
    } else if (authorsResponse?.error) {
        console.error("[BookShelf] Error fetching authors:", authorsResponse.error.message)
    }

    const books = booksResponse?.data ?? []
    const authors = authorsResponse?.data ?? []

    const filteredBooks = books.map((book) => ({
        ...book,
        coverImage: book?.cover_images?.[0],
        images: book?.cover_images,
        author: book?.author_name,
    }))

    const authorInfo = {
        "Chetan Bhagat": `Chetan Bhagat is the author of seven blockbuster books. These include six novels—Five Point Someone (2004), One Night @ the Call Center (2005), The 3 Mistakes of My Life (2008), 2 States (2009), Revolution 2020 (2011), Half Girlfriend (2014), and One Indian Girl (2016). His non-fiction works include What Young India Wants (2012) and India Positive (2019).

    Chetan's books have remained bestsellers since their release and have been equally celebrated on the big screen.

    The New York Times called him the 'the biggest selling English language novelist in India's history'. TIME magazine named him amongst the '100 most influential people in the world' and Fast Company listed him among the world's 100 most creative people in 2013.

    Chetan writes columns for leading English and Hindi newspapers, focusing on youth and national development issues. He is also a motivational speaker and screenplay writer.

    Chetan quit his international investment banking career in 2009 to devote his entire time to writing and making change happen in the country. He lives in Mumbai with his wife, Anusha, an ex-client of his.`,
        "Amish Tripathi": "Amish Tripathi is an Indian author known for his novels The Shiva Trilogy and the Ram Chandra Series. His debut work, The Immortals of Meluha, was a bestseller that earned him the Crossword Book Award and the Raymond Crossword Book Award.",
        "Sudha Murty": "Sudha Murty is an Indian engineering teacher, author and social worker. She is the chairperson of the Infosys Foundation and a member of public health care initiatives of the Government of Karnataka.",
    }

    function getPageHeader() {
        if (searchFilters.language === "en") return "English Books"
        if (searchFilters.language === "hindi") return "Hindi Books"
        return "All Books"
    }

    const selectedAuthorName =
        searchFilters.author_id !== "all" ? filteredBooks[0]?.author : null
    const selectedAuthorInfo = selectedAuthorName
        ? authorInfo[selectedAuthorName as keyof typeof authorInfo]
        : null

    const allLanguagesParams = new URLSearchParams()
    if (searchFilters.author_id !== "all") {
        allLanguagesParams.set("author", searchFilters.author_id)
    }
    const allLanguagesHref = allLanguagesParams.toString()
        ? `/bookShelf?${allLanguagesParams.toString()}`
        : "/bookShelf"

    const allAuthorsParams = new URLSearchParams()
    if (searchFilters.language !== "all") {
        allAuthorsParams.set("lang", searchFilters.language)
    }
    const allAuthorsHref = allAuthorsParams.toString()
        ? `/bookShelf?${allAuthorsParams.toString()}`
        : "/bookShelf"

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header user={user} />
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
                        <div className="md:w-1/4">
                            <h2 className="mb-5 text-3xl font-black text-black">Categories</h2>

                            <div className="mb-8">
                                <h3 className="mb-4 font-serif text-2xl font-black italic tracking-wide text-blue-700">
                                    <Link
                                        href={allLanguagesHref}
                                        className="transition-colors hover:text-blue-800"
                                    >
                                        All languages
                                    </Link>
                                </h3>
                                <LanguageMenusLists
                                    currentLang={searchFilters.language}
                                    currentAuthor={searchFilters.author_id}
                                />
                            </div>

                            <div>
                                <h3 className="mb-4 font-serif text-2xl font-black italic tracking-wide text-blue-700">
                                    <Link
                                        href={allAuthorsHref}
                                        className="transition-colors hover:text-blue-800"
                                    >
                                        All authors
                                    </Link>
                                </h3>
                                <AuthorsMenusLists
                                    initialAuthors={authors}
                                    currentAuthor={searchFilters.author_id}
                                    currentLanguage={searchFilters.language}
                                />
                            </div>
                        </div>

                        <div className="md:w-3/4">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-3xl font-bold text-slate-800">
                                    {getPageHeader()}
                                </h2>
                            </div>

                            {selectedAuthorInfo && filteredBooks.length > 0 && (
                                <Card className="mb-8">
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 text-2xl font-bold text-slate-800">
                                            {selectedAuthorName}
                                        </h3>
                                        <p className="whitespace-pre-line text-slate-600">
                                            {selectedAuthorInfo}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredBooks.map((book) => (
                                        <BookCard
                                            key={book.id}
                                            book={book}
                                            loggedinUserId={user?.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded border-2 border-dashed border-gray-300 py-12 text-center">
                                    <p className="text-lg text-slate-600">
                                        No books found matching your criteria.
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {searchFilters.language !== "all" &&
                                            `Language: ${searchFilters.language}`}
                                        {searchFilters.language !== "all" &&
                                            searchFilters.author_id !== "all" &&
                                            " | "}
                                        {searchFilters.author_id !== "all" &&
                                            `Author: ${searchFilters.author_id}`}
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
