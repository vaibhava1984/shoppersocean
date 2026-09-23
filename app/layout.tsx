import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import InteractionFeedback from "@/components/InteractionFeedback";
import SessionTimeout from "@/components/SessionTimeout";

// Use the site's permanent public origin for metadata during builds.
const defaultUrl = "https://www.shoppersocean.com";

// Clerk is enabled only during the explicit migration cutover.
// Until then the existing Supabase session remains untouched.
const clerkEnabled =
  process.env.CLERK_MIGRATION_ENABLED === "true" &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: "%s | Shoppers Ocean",
    default: "Shoppers Ocean",
  },
  description: "The fastest way1 to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = (
    <>
      <InteractionFeedback />
      <SessionTimeout />
      <main className="min-h-screen flex flex-col">
        {children}
      </main>
    </>
  );

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {clerkEnabled ? <ClerkProvider>{app}</ClerkProvider> : app}
      </body>
    </html>
  );
}
