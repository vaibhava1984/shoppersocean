import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";

type Item = { id: string; label: string; detail?: string | null; type: "book" | "author" | "section"; href: string; score: number };
const sections = [
  { id: "home", label: "Home", href: "/" },
  { id: "read-ebooks", label: "Read E-books", href: "/read-ebooks" },
  { id: "bookshelf", label: "Your Books", href: "/bookShelf" },
  { id: "entertainment", label: "Entertainment Hub", href: "/entertainment" },
  { id: "subscribe-now", label: "Subscribe Now", href: "/subscribe-now" },
  { id: "about", label: "About Shoppers Ocean", href: "/about" },
  { id: "services", label: "Services", href: "/services" },
  { id: "author-panel", label: "Author Panel", href: "/author-panel" },
];
function normalize(value: string) { return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = old;
    }
  }
  return row[b.length];
}
function rank(label: string, query: string): number {
  const text = normalize(label); const needle = normalize(query);
  if (!text || !needle) return 999;
  if (text === needle) return 0;
  if (text.startsWith(needle)) return 1;
  if (text.split(" ").some(word => word.startsWith(needle))) return 2;
  if (text.includes(needle)) return 3;
  const words = text.split(" ");
  const best = Math.min(distance(text, needle), ...words.map(word => distance(word, needle)));
  const allowed = needle.length < 5 ? 1 : needle.length < 9 ? 2 : 3;
  return best <= allowed ? 4 + best : 999;
}

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ suggestions: [] });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
    const items: Item[] = sections.map(section => ({ ...section, type: "section" as const, score: rank(section.label, q) }));
    const bookRows = await db.prepare("SELECT id,title,author_name FROM books WHERE COALESCE(is_deleted,0)=0 ORDER BY title ASC LIMIT 1500").all<{id:string;title:string;author_name:string|null}>();
    for (const book of bookRows.results ?? []) {
      const titleRank = rank(book.title, q);
      const authorRank = book.author_name ? rank(book.author_name, q) : 999;
      const score = Math.min(titleRank, authorRank + 2);
      if (score < 999) items.push({ id: String(book.id), label: book.title, detail: book.author_name, type: "book", href: `/book/${encodeURIComponent(book.id)}`, score });
    }
    const authors = await db.prepare("SELECT id,name FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name ASC LIMIT 500").all<{id:string;name:string}>();
    for (const author of authors.results ?? []) {
      const score = rank(author.name, q);
      if (score < 999) items.push({ id: String(author.id), label: author.name, type: "author", href: "/bookShelf?" + new URLSearchParams({ author: String(author.id), source: "homepage" }).toString(), score });
    }
    const ranked = items.filter(item => item.score < 999 && (item.type !== "section" || item.score < 999))
      .sort((a,b) => a.score - b.score || (a.type === "section" ? -1 : b.type === "section" ? 1 : a.label.localeCompare(b.label)))
      .slice(0, 12).map(({score: _score, ...item}) => item);
    return NextResponse.json({ suggestions: ranked });
  } catch (error) {
    console.error("Website search suggestions error:", error);
    return NextResponse.json({ error: "Unable to search suggestions" }, { status: 500 });
  }
}
