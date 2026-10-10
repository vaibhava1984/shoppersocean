"use client"

import Link from "next/link"
import { useState } from "react"
import { SUPPORTED_BOOK_GENRES } from "@/utils/book-genres"
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages"

type Author = { author_id: string; name: string }

type Props = {
  authors: Author[]
  languages: string[]
}

function makeHref(type: "genre" | "author" | "language", value: string) {
  const params = new URLSearchParams()
  if (type === "genre") params.set("genre", value)
  if (type === "author") params.set("author", value)
  if (type === "language") params.set("lang", value)
  params.set("source", "homepage")
  return "/bookShelf?" + params.toString()
}

export default function HomepageCategoryNavigation({ authors, languages }: Props) {
  const [open, setOpen] = useState<"genre" | "author" | "language" | null>(null)

  const toggle = (name: "genre" | "author" | "language") => {
    setOpen((current) => current === name ? null : name)
  }
  const sortedAuthors = [...authors].sort((a, b) => a.name.localeCompare(b.name))
  const sortedLanguages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...languages])).sort((a, b) => a.localeCompare(b))

  return (
    <div className="mx-auto mt-3 w-full max-w-3xl px-1 pb-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button type="button" onClick={() => toggle("genre")} aria-expanded={open === "genre"} className="min-h-[42px] rounded-lg bg-white px-2 py-2 text-center text-[11px] font-extrabold not-italic text-black shadow-md ring-1 ring-black/10 transition-all active:scale-95 sm:text-sm">
          Books by Genre
        </button>
        <button type="button" onClick={() => toggle("author")} aria-expanded={open === "author"} className="min-h-[42px] rounded-lg bg-white px-2 py-2 text-center text-[11px] font-extrabold not-italic text-black shadow-md ring-1 ring-black/10 transition-all active:scale-95 sm:text-sm">
          Books by Authors
        </button>
        <button type="button" onClick={() => toggle("language")} aria-expanded={open === "language"} className="min-h-[42px] rounded-lg bg-white px-2 py-2 text-center text-[11px] font-extrabold not-italic text-black shadow-md ring-1 ring-black/10 transition-all active:scale-95 sm:text-sm">
          Books by Language
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-xl border border-blue-100 bg-white p-2 shadow-md">
          {open === "genre" && SUPPORTED_BOOK_GENRES.map((genre) => (
            <Link key={genre} onClick={() => setOpen(null)} href={makeHref("genre", genre)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-50">
              {genre}
            </Link>
          ))}
          {open === "author" && (authors.length > 0 ? sortedAuthors.map((author) => (
            <Link key={author.author_id} onClick={() => setOpen(null)} href={makeHref("author", author.author_id)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-50">
              {author.name}
            </Link>
          )) : <p className="px-4 py-3 text-sm font-semibold text-black">No authors available yet.</p>)}
          {open === "language" && (sortedLanguages.map((language) => (
            <Link key={language} onClick={() => setOpen(null)} href={makeHref("language", language)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-50">
              {language}
            </Link>
          )
          ))}
        </div>
      )}
    </div>
  )
}