import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";
import FloatingSubscribeButton from "@/components/FloatingSubscribeButton";
import type { Metadata, Viewport } from "next";

// Canonical public origin and default social-sharing preview.
const defaultUrl = "https://shoppersocean.com";
const socialImage = "/homepage_hero%20(1).jpeg";

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true };

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: "%s | Shoppers Ocean",
    default: "Shoppers Ocean | Digital Flipbooks, Games, Quizzes & Learning",
  },
  description: "Discover interactive multilingual digital flipbooks, online games, quizzes, educational activities and brain challenges on Shoppers Ocean.",
  openGraph: {
    type: "website",
    siteName: "Shoppers Ocean",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Shoppers Ocean — Digital Flipbooks, Games, Quizzes & Learning" }],
  },
  twitter: {
    card: "summary_large_image",
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
        <FloatingSubscribeButton />
      </body>
    </html>
  );
}
