"use client"

import { Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type SearchSuggestion = {
  id: string
  label: string
  detail?: string | null
  type: "book" | "author" | "language" | "genre"
  href: string
}

export default function SiteSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search-books?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setResults(data.suggestions ?? [])
        setOpen(true)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search error:", error)
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative mx-auto mt-3 w-full max-w-2xl px-1">
      <div className="flex h-11 w-full items-center overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-blue-300">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false)
          }}
          placeholder="What are you looking for?"
          aria-label="What are you looking for?"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-slate-800 outline-none placeholder:text-slate-400"
        />
        <div className="flex h-full w-12 items-center justify-center text-slate-600" aria-hidden="true">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </div>
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-1 right-1 top-full z-[60] mt-1 overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/10">
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((item) => (
                <Link
                  key={item.type + ":" + item.id}
                  href={item.href}
                  onClick={() => { setOpen(false); setQuery("") }}
                  className="block border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="font-semibold text-slate-800">{item.label}</div>
                  <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {item.type === "book" ? "Book" : item.type === "author" ? "Author" : item.type === "language" ? "Language" : "Genre"}
                    {item.detail ? <span className="font-normal normal-case tracking-normal text-slate-500"> · {item.detail}</span> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">No close matches found. Try a book title, author, language, or genre.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
