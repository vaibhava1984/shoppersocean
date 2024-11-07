import { GeistSans } from "geist/font/sans";
import { Noto_Serif } from 'next/font/google'
import "./globals.css";

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
    template: '%s | ShoppersOcean',
    default: 'ShoppersOcean',
  },
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSerif.className}>

      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
