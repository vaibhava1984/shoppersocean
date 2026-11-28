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
        <button type="button" onClick={() => toggle("genre")} aria-expanded={open === "genre"} className="!min-h-[42px] rounded-lg border border-blue-800/40 !bg-blue-600 px-2 py-2 text-center !font-sans !text-xs !font-extrabold !not-italic tracking-wide !text-white shadow-md transition-all duration-200 hover:!bg-blue-700 active:scale-95 sm:!text-sm">
          Books by Genre
        </button>
        <button type="button" onClick={() => toggle("author")} aria-expanded={open === "author"} className="!min-h-[42px] rounded-lg border border-blue-800/40 !bg-blue-600 px-2 py-2 text-center !font-sans !text-xs !font-extrabold !not-italic tracking-wide !text-white shadow-md transition-all duration-200 hover:!bg-blue-700 active:scale-95 sm:!text-sm">
          Books by Authors
        </button>
        <button type="button" onClick={() => toggle("language")} aria-expanded={open === "language"} className="!min-h-[42px] rounded-lg border border-blue-800/40 !bg-blue-600 px-2 py-2 text-center !font-sans !text-[11px] !font-extrabold !not-italic tracking-wide !text-white shadow-md transition-all duration-200 hover:!bg-blue-700 active:scale-95 sm:!text-sm">
          Choose Your Language
        </button>
      </div>

      {open && (
        <div className="flipbook-menu-panel mt-2 rounded-xl border border-blue-950 bg-blue-800 p-2 shadow-xl">
          {open === "genre" && SUPPORTED_BOOK_GENRES.map((genre, index) => (
            <Link key={genre} onClick={() => setOpen(null)} href={makeHref("genre", genre)} className="flipbook-menu-item mb-1 block rounded-lg border border-blue-500/40 bg-blue-700 px-4 py-2.5 font-sans text-sm font-semibold not-italic tracking-wide text-white transition-colors hover:border-blue-300 hover:bg-blue-600 hover:text-white" style={{ animationDelay: `${index * 500}ms` }}>
              {genre}
            </Link>
          ))}
          {open === "author" && (authors.length > 0 ? sortedAuthors.map((author, index) => (
            <Link key={author.author_id} onClick={() => setOpen(null)} href={makeHref("author", author.author_id)} className="flipbook-menu-item mb-1 block rounded-lg border border-blue-500/40 bg-blue-700 px-4 py-2.5 font-sans text-sm font-semibold not-italic tracking-wide text-white transition-colors hover:border-blue-300 hover:bg-blue-600 hover:text-white" style={{ animationDelay: `${index * 500}ms` }}>
              {author.name}
            </Link>
          )) : <p className="px-4 py-3 font-sans text-sm font-semibold not-italic text-slate-700">No authors available yet.</p>)}
          {open === "language" && sortedLanguages.map((language, index) => (
            <Link key={language} onClick={() => setOpen(null)} href={makeHref("language", language)} className="flipbook-menu-item mb-1 block rounded-lg border border-blue-500/40 bg-blue-700 px-4 py-2.5 font-sans text-sm font-semibold not-italic tracking-wide text-white transition-colors hover:border-blue-300 hover:bg-blue-600 hover:text-white" style={{ animationDelay: `${index * 500}ms` }}>
              {language}
            </Link>
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes flipbookMenuReveal {
          from { opacity: 0; transform: translateY(-7px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .flipbook-menu-panel { animation: flipbookMenuReveal 0.5s ease both; }
        .flipbook-menu-item { opacity: 0; animation: flipbookMenuReveal 0.5s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .flipbook-menu-panel, .flipbook-menu-item { animation: none; }
        }
      `}</style>
    </div>
  )
}