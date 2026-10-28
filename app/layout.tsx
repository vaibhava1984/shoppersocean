import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";
import type { Metadata } from "next";

// Canonical public origin and default social-sharing preview.
const defaultUrl = "https://shoppersocean.com";
const socialImage = "/1.jpg?rev=2";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: "%s | Shoppers Ocean",
    default: "Shoppers Ocean — Play, Think, Discover & Read",
  },
  description: "Play. Connect. Compete. Your Next Favourite Escape Starts Here. Explore games, quizzes, brain challenges and beautifully designed online flipbooks at Shoppers Ocean.",
  openGraph: {
    type: "website",
    url: defaultUrl,
    siteName: "Shoppers Ocean",
    title: "Shoppers Ocean — Play, Think, Discover & Read",
    description: "Play. Connect. Compete. Your Next Favourite Escape Starts Here.",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Shoppers Ocean — Play. Connect. Compete. Your Next Favourite Escape Starts Here." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shoppers Ocean — Play, Think, Discover & Read",
    description: "Play. Connect. Compete. Your Next Favourite Escape Starts Here.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <InteractionFeedback />
        <SessionTimeout />
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
