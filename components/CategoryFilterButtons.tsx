"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener("pointerdown", handleOutside)
    return () => document.removeEventListener("pointerdown", handleOutside)
  }, [open])
  const router = useRouter()
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

  return (
    <div ref={menuRef} className="mb-4 flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) router.back()
          else router.push("/")
        }}
        aria-label="Go back"
        className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 active:scale-[0.98]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mr-2 h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back
      </button>
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
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
                <div className="absolute left-0 top-full z-30 mt-1 max-h-60 min-w-52 max-w-[85vw] overflow-y-auto overscroll-contain rounded-xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/60 to-cyan-50 p-1.5 shadow-xl ring-1 ring-blue-100/70">
                  {filter.values.map((value) => (
                    <Link
                      key={value}
                      href={makeHref(filter.key, value)}
                      onClick={() => setOpen(null)}
                      className="mb-0.5 block rounded-lg border border-transparent px-3 py-2 text-sm font-bold tracking-wide text-slate-800 transition-all hover:border-blue-100 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                    >
                      {value}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
