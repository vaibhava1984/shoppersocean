"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

type Author = { author_id: string; name: string }

type Props = {
    authors: Author[]
    languages: string[]
    currentAuthor?: string
    currentLanguage?: string
    currentGenre?: string
}

const genres = [
    "Suspense and Thriller",
    "Science Fiction",
    "Historical Fiction",
    "Historical Non fiction",
    "Novel/Stories",
    "Short Stories",
    "Philosophy and Literature",
    "Learning and Education",
    "Guide/How to",
    "Memoir and Biographies",
    "Books for Children",
]

function makeHref(type: "genre" | "author" | "language", value: string, props: Props) {
    // Each category choice is a new filter. Do not carry the previous
    // genre/author/language into the next choice, otherwise a genre with
    // zero books can incorrectly block a valid author/language selection.
    const params = new URLSearchParams()
    if (type === "genre") params.set("genre", value)
    if (type === "author") params.set("author", value)
    if (type === "language") params.set("lang", value)
    return "/bookShelf" + (params.toString() ? "?" + params.toString() : "")
}

export default function CategoriesAccordion(props: Props) {
    const [open, setOpen] = useState<string | null>(null)
    const toggle = (name: string) => setOpen((current) => current === name ? null : name)

    const buttonClass = (name: string) =>
        "group relative flex min-h-14 w-full items-center justify-between overflow-hidden rounded-xl bg-blue-600 px-4 py-3 text-left text-base font-extrabold text-white shadow-lg shadow-blue-300/40 ring-1 ring-blue-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-400/50 active:scale-[0.98] before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:skew-x-[-20deg] before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent category-shimmer " +
        (open === name ? "ring-2 ring-blue-200/80" : "")

    const menuClass = (isOpen: boolean) =>
        "grid transition-[grid-template-rows,opacity] duration-500 ease-out " +
        (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")

    return (
        <>
            <style>{`
                @keyframes categoryShimmer {
                    0%, 55% { transform: translateX(-180%) skewX(-20deg); opacity: 0; }
                    65% { opacity: 1; }
                    90%, 100% { transform: translateX(520%) skewX(-20deg); opacity: 0; }
                }
                .category-shimmer::before {
                    animation: categoryShimmer 3.8s ease-in-out infinite;
                }
            `}</style>
            <div className="space-y-4">
            <div>
                <button type="button" onClick={() => toggle("genre")} className={buttonClass("genre")} aria-expanded={open === "genre"}>
                    <span>Books by Genre</span><ChevronDown className={"h-5 w-5 transition-transform duration-300 " + (open === "genre" ? "rotate-180" : "")} />
                </button>
                <div className={menuClass(open === "genre")}><div className="overflow-hidden"><div className="mt-2 rounded-xl border border-blue-100 bg-white/95 p-2 shadow-md">
                    {genres.map((genre) => <Link key={genre} href={makeHref("genre", genre, props)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black [text-shadow:0_1px_0_white,0_-1px_0_white,1px_0_white,-1px_0_white] transition-all duration-200 hover:bg-blue-50 hover:pl-6">{genre}</Link>)}
                </div></div></div>
            </div>

            <div>
                <button type="button" onClick={() => toggle("authors")} className={buttonClass("authors")} aria-expanded={open === "authors"}>
                    <span>Books by Authors</span><ChevronDown className={"h-5 w-5 transition-transform duration-300 " + (open === "authors" ? "rotate-180" : "")} />
                </button>
                <div className={menuClass(open === "authors")}><div className="overflow-hidden"><div className="mt-2 rounded-xl border border-blue-100 bg-white/95 p-2 shadow-md">
                    {props.authors.length > 0 ? props.authors.map((author) => <Link key={author.author_id} href={makeHref("author", author.author_id, props)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black [text-shadow:0_1px_0_white,0_-1px_0_white,1px_0_white,-1px_0_white] transition-all duration-200 hover:bg-blue-50 hover:pl-6">{author.name}</Link>) : <p className="px-4 py-3 text-sm font-semibold text-black">No authors available yet.</p>}
                </div></div></div>
            </div>

            <div>
                <button type="button" onClick={() => toggle("languages")} className={buttonClass("languages")} aria-expanded={open === "languages"}>
                    <span>Books by Language</span><ChevronDown className={"h-5 w-5 transition-transform duration-300 " + (open === "languages" ? "rotate-180" : "")} />
                </button>
                <div className={menuClass(open === "languages")}><div className="overflow-hidden"><div className="mt-2 rounded-xl border border-blue-100 bg-white/95 p-2 shadow-md">
                    {props.languages.length > 0 ? props.languages.map((language) => <Link key={language} href={makeHref("language", language, props)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black [text-shadow:0_1px_0_white,0_-1px_0_white,1px_0_white,-1px_0_white] transition-all duration-200 hover:bg-blue-50 hover:pl-6">{language}</Link>) : <p className="px-4 py-3 text-sm font-semibold text-black">No languages available yet.</p>}
                </div></div></div>
            </div>
            </div>
        </>
    )
}
