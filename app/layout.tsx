import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";

// Use the site's permanent public origin for metadata during builds.
const defaultUrl = "https://www.shoppersocean.com";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: '%s | Shoppers Ocean',
    default: 'Shoppers Ocean',
  },
  description: "Online books and lightweight flipbook reading at Shoppers Ocean",
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
