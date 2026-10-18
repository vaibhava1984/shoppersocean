"use client"

import Link from "next/link"
import { useState } from "react"
import { SUPPORTED_BOOK_GENRES } from "@/utils/book-genres"
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages"

type Props = {
  genre?: string
  author?: string
  language?: string
  languages: string[]
}

export default function CategoryFilterButtons({ genre = "", author = "", language = "", languages }: Props) {
  const [open, setOpen] = useState<"genre" | "language" | null>(null)
  const availableLanguages = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...languages])).sort((a, b) => a.localeCompare(b))
  const filters: Array<{ key: "genre" | "language"; label: string; values: string[] }> = []

  if (genre || author) filters.push({ key: "language", label: author ? "Choose by Language" : "Choose Your Language", values: availableLanguages })
  if (language || author) filters.push({ key: "genre", label: author ? "Choose by Genre" : "Choose Genre", values: SUPPORTED_BOOK_GENRES })

  function makeHref(key: "genre" | "language", value: string) {
    const params = new URLSearchParams()
    if (genre) params.set("genre", genre)
    if (author) params.set("author", author)
    if (language) params.set("lang", language)
    params.set(key === "genre" ? "genre" : "lang", value)
    return "/bookShelf?" + params.toString()
  }

  if (!filters.length) return null

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => current === filter.key ? null : filter.key)}
            aria-expanded={open === filter.key}
            className="min-h-[38px] rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.98]"
          >
            {filter.label}
          </button>
          {open === filter.key && (
            <div className="absolute left-0 top-full z-30 mt-1 max-h-60 min-w-52 max-w-[85vw] overflow-y-auto overscroll-contain rounded-lg border border-blue-100 bg-white p-1 shadow-xl">
              {filter.values.map((value) => (
                <Link
                  key={value}
                  href={makeHref(filter.key, value)}
                  onClick={() => setOpen(null)}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50"
                >
                  {value}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
