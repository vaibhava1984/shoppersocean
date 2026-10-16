import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import MySales from "./mySales";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Sales", description: "Your Shoppers Ocean sales" };

export default async function MySalesPage({ searchParams }: { searchParams?: Promise<{ timeFrame?: string }> }) {
  const user = await getCurrentUser();
  let authorId: string | null = null;

  if (user?.publicMetadata?.isAuthor === true) {
    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");
    const profile = await db.prepare("SELECT id FROM users WHERE id = ? LIMIT 1").bind(user.id).first<{ id: string }>();
    if (profile) {
      const author = await db.prepare("SELECT id AS author_id FROM authors WHERE user_id = ? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(profile.id).first<{ author_id: string }>();
      authorId = author?.author_id ?? null;
    }
  }

  const params = searchParams ? await searchParams : {};
  const allowed = ["today", "week", "month", "year", "untilnow"] as const;
  const timeFrame = allowed.includes(params.timeFrame as any) ? params.timeFrame as typeof allowed[number] : "month";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="min-h-[55vh] py-10 bg-white">
        {authorId ? (
          <MySales authorId={authorId} timeFrame={timeFrame} />
        ) : (
          <div className="mx-auto flex min-h-[35vh] max-w-4xl items-center justify-center px-5 text-center">
            <p className="text-lg font-semibold text-slate-800">Sorry !! You are not registered as an author, please enjoy reading our Flipbooks.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
