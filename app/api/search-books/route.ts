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

    const escaped = q.replace(/[\\%_]/g, (c) => "\\" + c);
    const like = `%${escaped}%`;
    const startsWith = `${escaped}%`;
    const suggestions: Array<{ id: string; label: string; detail?: string | null; type: "book" | "author" | "language" | "genre"; href: string }> = [];

    const books = await db.prepare(
      "SELECT id,title,author_name,language,genre FROM books WHERE COALESCE(is_deleted,0)=0 AND (title LIKE ? ESCAPE '\\\\' COLLATE NOCASE OR author_name LIKE ? ESCAPE '\\\\' COLLATE NOCASE OR language LIKE ? ESCAPE '\\\\' COLLATE NOCASE OR genre LIKE ? ESCAPE '\\\\' COLLATE NOCASE) ORDER BY CASE WHEN title LIKE ? ESCAPE '\\\\' COLLATE NOCASE THEN 0 ELSE 1 END, title ASC LIMIT 8"
    ).bind(like, like, like, like, startsWith).all<{ id: string; title: string; author_name: string | null; language: string | null; genre: string | null }>();

    for (const book of books.results ?? []) {
      suggestions.push({ id: String(book.id), label: book.title, detail: [book.author_name, book.language].filter(Boolean).join(" · "), type: "book", href: `/book/${book.id}` });
    }

    const authors = await db.prepare(
      "SELECT author_id,name FROM authors WHERE COALESCE(is_deleted,0)=0 AND name LIKE ? ESCAPE '\\\\' COLLATE NOCASE ORDER BY CASE WHEN name LIKE ? ESCAPE '\\\\' COLLATE NOCASE THEN 0 ELSE 1 END, name ASC LIMIT 4"
    ).bind(like, startsWith).all<{ author_id: string; name: string }>();

    for (const author of authors.results ?? []) {
      suggestions.push({ id: String(author.author_id), label: author.name, type: "author", href: "/bookShelf?" + new URLSearchParams({ author: String(author.author_id), source: "homepage" }).toString() });
    }

    const languageRows = await db.prepare(
      "SELECT DISTINCT language FROM books WHERE COALESCE(is_deleted,0)=0 AND language IS NOT NULL AND language LIKE ? ESCAPE '\\\\' COLLATE NOCASE ORDER BY language ASC LIMIT 6"
    ).bind(like).all<{ language: string }>();
    const foundLanguages = new Map<string, string>();
    for (const language of [...SUPPORTED_BOOK_LANGUAGES, ...(languageRows.results ?? []).map((row) => row.language)]) {
      if (language.toLocaleLowerCase().includes(q.toLocaleLowerCase())) foundLanguages.set(language.toLocaleLowerCase(), language);
    }
    for (const language of foundLanguages.values()) {
      suggestions.push({ id: language, label: language, type: "language", href: "/bookShelf?" + new URLSearchParams({ lang: language, source: "homepage" }).toString() });
    }

    for (const genre of SUPPORTED_BOOK_GENRES) {
      if (genre.toLocaleLowerCase().includes(q.toLocaleLowerCase())) {
        suggestions.push({ id: genre, label: genre, type: "genre", href: "/bookShelf?" + new URLSearchParams({ genre, source: "homepage" }).toString() });
      }
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 14) });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ error: "Unable to search suggestions" }, { status: 500 });
  }
}
