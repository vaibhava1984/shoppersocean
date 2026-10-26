import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";

// Use the canonical non-www public origin for metadata URLs.
const defaultUrl = "https://shoppersocean.com";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: '%s | Shoppers Ocean',
    default: 'Shoppers Ocean',
  },
  description: "Shoppers Ocean — discover and enjoy books online.",
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
