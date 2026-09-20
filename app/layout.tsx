import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";

// Use the site's permanent public origin for metadata during builds.
const defaultUrl = "https://www.shoppersocean.com";

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
    <html lang="en">
      <body className="bg-background text-foreground">
        <InteractionFeedback />
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
