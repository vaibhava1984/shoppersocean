import FlipbookPageClient from './FlipbookPageClient';
import { getD1 } from "@/utils/cloudflare/d1";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }): Promise<Metadata> {
  const { bookId } = await params;
  const db = getD1();
  const fallback = "Read this digital flipbook on Shoppers Ocean.";
  if (!db) return { title: "Read Flipbook | Shoppers Ocean", description: fallback };
  try {
    const book = await db.prepare("SELECT title, description, cover_images FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1").bind(bookId).first<Record<string, any>>();
    if (!book) return { title: "Flipbook not found | Shoppers Ocean", description: fallback };
    const title = String(book.title || "Digital Flipbook").trim();
    const descriptionText = String(book.description || fallback).replace(/\\s+/g, " ").trim();
    const description = descriptionText.length > 200 ? descriptionText.slice(0, 197).trimEnd() + "..." : descriptionText;
    let covers: string[] = [];
    try {
      const parsed = typeof book.cover_images === "string" ? JSON.parse(book.cover_images) : book.cover_images;
      if (Array.isArray(parsed)) covers = parsed.filter((item): item is string => typeof item === "string");
      else if (typeof parsed === "string") covers = [parsed];
    } catch { if (typeof book.cover_images === "string" && book.cover_images) covers = [book.cover_images]; }
    const images = covers.slice(0, 2).map((image, index) => {
      if (/^data:image\\/(png|jpe?g|webp|gif|avif);base64,/i.test(image)) return `https://shoppersocean.com/api/public/book-cover/${encodeURIComponent(bookId)}/${index}`;
      try { return new URL(image, "https://shoppersocean.com").toString(); } catch { return ""; }
    }).filter(Boolean);
    const canonical = `https://shoppersocean.com/flipbook/${encodeURIComponent(bookId)}`;
    const previewImages = images.length ? images : ["https://shoppersocean.com/homepage_hero%20(1).jpeg"];
    return {
      title, description, alternates: { canonical },
      openGraph: { type: "book", url: canonical, siteName: "Shoppers Ocean", title: `${title} | Shoppers Ocean`, description, images: previewImages.map((url) => ({ url, alt: `Cover of ${title}` })) },
      twitter: { card: "summary_large_image", title: `${title} | Shoppers Ocean`, description, images: previewImages },
    };
  } catch {
    return { title: "Read Flipbook | Shoppers Ocean", description: fallback };
  }
}


export default async function FlipbookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  return <FlipbookPageClient bookId={bookId} />;
}
