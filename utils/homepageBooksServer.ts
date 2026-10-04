import { getD1 } from "@/utils/cloudflare/d1";
import type { HomepageBookPlacement } from "./homepageBooksCache";

export async function getHomepageBooksServer(): Promise<HomepageBookPlacement[]> {
  const db = getD1();
  if (!db) return [];
  const layoutData = await db.prepare(
    "SELECT page_section, value FROM layout_settings WHERE page_section IN ('HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION') ORDER BY id ASC"
  ).all<Record<string, any>>();
  if (!layoutData.results.length) return [];
  const selectedIds = [...new Set(layoutData.results.map(item => String(item.value ?? "").trim()).filter(Boolean))];
  if (!selectedIds.length) return [];
  const placeholders = selectedIds.map(() => "?").join(",");
  const booksData = await db.prepare(
    `SELECT id, title, description, cover_images, author_name, price FROM books WHERE COALESCE(is_deleted, 0) = 0 AND id IN (${placeholders})`
  ).bind(...selectedIds).all<Record<string, any>>();
  const parseImages = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
    if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
    return [];
  };
  const booksById = new Map(booksData.results.map(book => {
    const images = parseImages(book.cover_images);
    return [String(book.id), { id: String(book.id), title: book.title, description: book.description ?? "", coverImage: images[0], images, author: book.author_name, price: Number(book.price ?? 0) }];
  }));
  return layoutData.results.map(item => {
    const book = booksById.get(String(item.value ?? "").trim());
    return book ? { ...book, pageSection: item.page_section } : null;
  }).filter((book): book is HomepageBookPlacement => Boolean(book));
}
