import { GeistSans } from "geist/font/sans";
import { Noto_Serif } from 'next/font/google'
import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: '%s | Shoppers Ocean',
    default: 'Shoppers Ocean',
  },
  description: "The fastest way1 to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSerif.className}>
      <body className="bg-background text-foreground">
        <InteractionFeedback />
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
