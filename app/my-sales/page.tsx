import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import { redirect } from "next/navigation";
import MySales from "./mySales";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Sales", description: "My Sales" };

export default async function MySalesPage({searchParams}:{searchParams?:Promise<{timeFrame?:string}>}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.publicMetadata?.isAuthor !== true) redirect("/");

  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");

  const profile = await db.prepare("SELECT id FROM users WHERE id = ? LIMIT 1").bind(user.id).first<{id:string}>();
  if (!profile) redirect("/");

  const author = await db.prepare("SELECT id AS author_id FROM authors WHERE user_id = ? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(profile.id).first<{author_id:string}>();
  if (!author?.author_id) redirect("/");

  const params=searchParams?await searchParams:{};
  const allowed=["today","week","month","year","untilnow"] as const;
  const timeFrame=allowed.includes(params.timeFrame as any)?params.timeFrame as typeof allowed[number]:"month";

  return <div className="min-h-screen bg-slate-50 text-slate-900"><Header /><section className="py-10 bg-white"><MySales authorId={author.author_id} timeFrame={timeFrame}/></section><Footer /></div>;
}
