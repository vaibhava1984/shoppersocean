import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";

const defaultUrl = "https://www.shoppersocean.com";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: { template: "%s | Shoppers Ocean", default: "Shoppers Ocean" },
  description: "Shoppers Ocean",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ClerkProvider dynamic>
          <InteractionFeedback />
          <SessionTimeout />
          <main className="min-h-screen flex flex-col">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
