import type { MetadataRoute } from "next";
import { getD1 } from "@/utils/cloudflare/d1";

const SITE_URL = "https://www.shoppersocean.com";

// Keep the sitemap request-time generated so newly published books can be
// discovered without requiring a code change for every new book.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/bookShelf`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/books-for-children`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const db = getD1();
    if (!db) return pages;

    const result = await db
      .prepare(
        "SELECT id, published_date FROM books WHERE COALESCE(is_deleted, 0) = 0 AND id IS NOT NULL"
      )
      .all<{ id: string | number; published_date?: string | null }>();

    for (const book of result.results ?? []) {
      const id = String(book.id ?? "").trim();
      if (!id) continue;

      const item: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/book/${encodeURIComponent(id)}`,
        changeFrequency: "monthly",
        priority: 0.7,
      };

      if (book.published_date) {
        const publishedDate = new Date(book.published_date);
        if (!Number.isNaN(publishedDate.getTime())) item.lastModified = publishedDate;
      }

      pages.push(item);
    }
  } catch (error) {
    // Keep core public pages available in the sitemap if D1 is temporarily
    // unavailable; book URLs will be added again on the next successful request.
    console.error("Unable to load book URLs for sitemap:", error);
  }

  return pages;
}
