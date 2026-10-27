"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
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
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener("pointerdown", handleOutside)
    return () => document.removeEventListener("pointerdown", handleOutside)
  }, [open])

  const toggle = (name: "genre" | "author" | "language") => {
    setOpen((current) => current === name ? null : name)
  }
  const sortedAuthors = [...authors].sort((a, b) => a.name.localeCompare(b.name))
  const sortedLanguages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...languages])).sort((a, b) => a.localeCompare(b))

  return (
    <div ref={menuRef} className="mx-auto mt-3 w-full max-w-3xl px-1 pb-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button type="button" onClick={() => toggle("genre")} aria-expanded={open === "genre"} className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-2 py-2 text-center font-serif text-[11px] font-black tracking-tight text-[#050505] shadow-md ring-1 ring-black/10 transition-all hover:border-slate-500 hover:bg-white active:scale-95 sm:text-sm">
          Books by Genre
        </button>
        <button type="button" onClick={() => toggle("author")} aria-expanded={open === "author"} className="min-h-[42px] rounded-lg bg-white px-2 py-2 text-center text-[11px] font-extrabold not-italic text-[#0A0A0A] shadow-md ring-1 ring-black/10 transition-all active:scale-95 sm:text-sm">
          Books by Authors
        </button>
        <button type="button" onClick={() => toggle("language")} aria-expanded={open === "language"} className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-2 py-2 text-center font-serif text-[11px] font-black tracking-tight text-[#050505] shadow-md ring-1 ring-black/10 transition-all hover:border-slate-500 hover:bg-white active:scale-95 sm:text-sm language-bob">
          Choose Your Language
        </button>
      </div>

      {open && (
        <div className="category-dropdown-panel mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {open === "genre" && SUPPORTED_BOOK_GENRES.map((genre) => (
            <Link key={genre} onClick={() => setOpen(null)} href={makeHref("genre", genre)} className="mb-1 block rounded-lg border border-transparent px-4 py-2.5 font-serif text-sm font-bold tracking-wide text-[#111111] transition-all hover:border-slate-200 hover:bg-white hover:text-black hover:shadow-sm">
              {genre}
            </Link>
          ))}
          {open === "author" && (authors.length > 0 ? sortedAuthors.map((author) => (
            <Link key={author.author_id} onClick={() => setOpen(null)} href={makeHref("author", author.author_id)} className="block rounded-lg px-4 py-2.5 font-serif text-sm font-bold tracking-wide text-[#111111] transition-colors hover:bg-white hover:text-black">
              {author.name}
            </Link>
          )) : <p className="px-4 py-3 font-serif text-sm font-semibold text-[#111111]">No authors available yet.</p>)}
          {open === "language" && sortedLanguages.map((language) => (
            <Link key={language} onClick={() => setOpen(null)} href={makeHref("language", language)} className="block rounded-lg px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-50">
              {language}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}