import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";
import FloatingSubscribeButton from "@/components/FloatingSubscribeButton";
import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";

const defaultUrl = "https://shoppersocean.com";
const pageDetails: Record<string, { title: string; description: string; preview: string }> = {
  "/": { title: "Shoppers Ocean", description: "Digital flipbooks, games, quizzes, learning and entertainment in one destination.", preview: "home" },
  "/about": { title: "About Shoppers Ocean", description: "Discover the world of reading, learning, gaming and entertainment at Shoppers Ocean.", preview: "about" },
  "/books": { title: "Explore Digital Books", description: "Discover multilingual books and interactive digital flipbooks.", preview: "books" },
  "/bookShelf": { title: "Flipbook Library", description: "Explore the Shoppers Ocean digital flipbook library.", preview: "bookshelf" },
  "/books-for-children": { title: "Books for Children", description: "Discover stories and reading adventures for young readers.", preview: "children" },
  "/entertainment": { title: "Entertainment", description: "Explore games, quizzes, riddles and brain challenges.", preview: "entertainment" },
  "/classic-games": { title: "Classic Games", description: "Play engaging games on Shoppers Ocean.", preview: "games" },
  "/learning-academy": { title: "Learning Academy", description: "Build knowledge and strengthen your English skills.", preview: "learning" },
  "/quiz-world": { title: "Quiz World", description: "Challenge yourself with quizzes, trivia and brain teasers.", preview: "quizzes" },
  "/read-ebooks": { title: "Read E-books", description: "Read digital books and enjoy your reading experience.", preview: "read-ebooks" },
  "/services": { title: "Our Services", description: "Explore flipbooks, author publishing, games and learning.", preview: "services" },
  "/contact": { title: "Contact Shoppers Ocean", description: "Get in touch with the Shoppers Ocean team.", preview: "contact" },
  "/create-your-flipbook": { title: "Create Your Flipbook", description: "Publish your work as a digital flipbook on Shoppers Ocean.", preview: "authors" },
  "/submit-your-book": { title: "Submit Your Book", description: "Submit your book for publication on Shoppers Ocean.", preview: "authors" },
  "/author-policies": { title: "Author Policies", description: "Guidelines and information for Shoppers Ocean authors.", preview: "policies" },
  "/privacy-policy": { title: "Privacy Policy", description: "Read the Shoppers Ocean privacy policy.", preview: "privacy" },
  "/terms-and-conditions": { title: "Terms and Conditions", description: "Read the terms and conditions for Shoppers Ocean.", preview: "terms" },
  "/subscribe": { title: "Subscribe to Shoppers Ocean", description: "Explore subscription options on Shoppers Ocean.", preview: "subscribe" },
  "/subscribe-now": { title: "Subscribe to Shoppers Ocean", description: "Explore subscription options on Shoppers Ocean.", preview: "subscribe" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true };

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-shoppers-ocean-path") || "/";
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const known = pageDetails[path];
  const privatePath = /^\/(admin_panel|author-panel|my-purchases|my-sales|settings|login|forgot-password|reset-password|update-password|protected|debug|payment)(\/|$)/i.test(path)
    || /\/register$|\/submitted$/.test(path);
  const lastSegment = path.split("/").filter(Boolean).pop() || "home";
  const title = known?.title || (path.startsWith("/book/") ? "Book Details" : path.startsWith("/flipbook/") ? "Read Flipbook" : lastSegment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  const description = known?.description || (path.startsWith("/book/") ? "Discover this book on Shoppers Ocean." : path.startsWith("/flipbook/") ? "Read this digital flipbook on Shoppers Ocean." : "Explore this page on Shoppers Ocean.");
  const slug = known?.preview || (path === "/" ? "home" : path.slice(1).replace(/\//g, "--"));
  const image = `/api/share-preview/${encodeURIComponent(slug)}`;
  return {
    metadataBase: new URL(defaultUrl),
    title: { absolute: `${title} | Shoppers Ocean` },
    description,
    alternates: { canonical: path },
    robots: privatePath ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
    openGraph: {
      type: "website", siteName: "Shoppers Ocean", url: path, title: `${title} | Shoppers Ocean`, description,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — Shoppers Ocean page preview` }],
    },
    twitter: { card: "summary_large_image", title: `${title} | Shoppers Ocean`, description, images: [image] },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <InteractionFeedback />
        <SessionTimeout />
        <main className="min-h-screen flex flex-col">{children}</main>
        <FloatingSubscribeButton />
      </body>
    </html>
  );
}
