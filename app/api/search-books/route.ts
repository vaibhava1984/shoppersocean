import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { SUPPORTED_BOOK_GENRES } from "@/utils/book-genres";
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages";

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ suggestions: [] });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });

    const escaped = q.replace(/[!%_]/g, (c) => "!" + c);
    const like = `%${escaped}%`;
    const startsWith = `${escaped}%`;
    type Suggestion = { id: string; label: string; detail?: string | null; type: "book" | "author" | "language" | "genre"; href: string };
    const suggestions: Array<Suggestion & { score: number }> = [];

    // Rank the actual match, not just the order in which each result type was queried.
    // Exact matches beat prefixes, prefixes beat word-prefix matches, and those beat
    // general contains matches. A book matched only through its author is ranked below
    // the author result itself, while a direct book-title match stays highly relevant.
    const matchRank = (value: string | null | undefined): number => {
      const text = (value ?? "").trim().toLocaleLowerCase();
      const needle = q.toLocaleLowerCase();
      if (!text) return 99;
      if (text === needle) return 0;
      if (text.startsWith(needle)) return 1;
      if (text.split(/\s+/).some((word) => word.startsWith(needle))) return 2;
      if (text.includes(needle)) return 3;
      return 99;
    };
    const scoreMatch = (rank: number, fieldWeight = 0) => rank * 100 + fieldWeight;

    const books = await db.prepare(
      "SELECT id,title,author_name,language,genre FROM books WHERE COALESCE(is_deleted,0)=0 AND (title LIKE ? ESCAPE '!' COLLATE NOCASE OR author_name LIKE ? ESCAPE '!' COLLATE NOCASE OR language LIKE ? ESCAPE '!' COLLATE NOCASE OR genre LIKE ? ESCAPE '!' COLLATE NOCASE) ORDER BY CASE WHEN title LIKE ? ESCAPE '!' COLLATE NOCASE THEN 0 ELSE 1 END, title ASC LIMIT 8"
    ).bind(like, like, like, like, startsWith).all<{ id: string; title: string; author_name: string | null; language: string | null; genre: string | null }>();

    for (const book of books.results ?? []) {
      const titleRank = matchRank(book.title);
      const authorRank = matchRank(book.author_name);
      const languageRank = matchRank(book.language);
      const genreRank = matchRank(book.genre);
      const score = Math.min(
        scoreMatch(titleRank, 0),
        scoreMatch(authorRank, 20),
        scoreMatch(languageRank, 10),
        scoreMatch(genreRank, 10),
      );
      suggestions.push({ id: String(book.id), label: book.title, detail: [book.author_name, book.language].filter(Boolean).join(" · "), type: "book", href: `/book/${book.id}`, score });
    }

    const authors = await db.prepare(
      "SELECT id AS author_id,name FROM authors WHERE COALESCE(is_deleted,0)=0 AND name LIKE ? ESCAPE '!' COLLATE NOCASE ORDER BY CASE WHEN name LIKE ? ESCAPE '!' COLLATE NOCASE THEN 0 ELSE 1 END, name ASC LIMIT 4"
    ).bind(like, startsWith).all<{ author_id: string; name: string }>();

    for (const author of authors.results ?? []) {
      suggestions.push({ id: String(author.author_id), label: author.name, type: "author", href: "/bookShelf?" + new URLSearchParams({ author: String(author.author_id), source: "homepage" }).toString(), score: scoreMatch(matchRank(author.name), 0) });
    }

    const languageRows = await db.prepare(
      "SELECT DISTINCT language FROM books WHERE COALESCE(is_deleted,0)=0 AND language IS NOT NULL AND language LIKE ? ESCAPE '!' COLLATE NOCASE ORDER BY language ASC LIMIT 6"
    ).bind(like).all<{ language: string }>();
    const foundLanguages = new Map<string, string>();
    for (const language of [...SUPPORTED_BOOK_LANGUAGES, ...(languageRows.results ?? []).map((row) => row.language)]) {
      if (language.toLocaleLowerCase().includes(q.toLocaleLowerCase())) foundLanguages.set(language.toLocaleLowerCase(), language);
    }
    for (const language of foundLanguages.values()) {
      suggestions.push({ id: language, label: language, type: "language", href: "/bookShelf?" + new URLSearchParams({ lang: language, source: "homepage" }).toString(), score: scoreMatch(matchRank(language), 0) });
    }

    for (const genre of SUPPORTED_BOOK_GENRES) {
      if (genre.toLocaleLowerCase().includes(q.toLocaleLowerCase())) {
        suggestions.push({ id: genre, label: genre, type: "genre", href: "/bookShelf?" + new URLSearchParams({ genre, source: "homepage" }).toString(), score: scoreMatch(matchRank(genre), 0) });
      }
    }

    const typeTieBreak: Record<Suggestion["type"], number> = { author: 0, language: 1, genre: 2, book: 3 };
    const ranked = suggestions
      .sort((a, b) => a.score - b.score || typeTieBreak[a.type] - typeTieBreak[b.type] || a.label.localeCompare(b.label))
      .slice(0, 14)
      .map(({ score: _score, ...suggestion }) => suggestion);

    return NextResponse.json({ suggestions: ranked });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ error: "Unable to search suggestions" }, { status: 500 });
  }
}
