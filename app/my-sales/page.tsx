import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { currentUser } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { redirect } from "next/navigation";
import MySales from "./mySales";

export const metadata = { title: "My Sales", description: "My Sales" };

export default async function MySalesPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  if (user.publicMetadata?.isAuthor !== true) redirect("/");

  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");

  const email = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses?.[0]?.emailAddress ?? "";
  const profile = await db.prepare("SELECT id FROM profiles WHERE clerk_user_id = ? OR lower(email) = lower(?) LIMIT 1").bind(user.id, email).first<{id:string}>();
  if (!profile) redirect("/");

  const author = await db.prepare("SELECT author_id FROM authors WHERE user_id = ? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(profile.id).first<{author_id:string}>();
  if (!author?.author_id) redirect("/");

  return <div className="min-h-screen bg-slate-50 text-slate-900"><Header /><section className="py-10 bg-white"><MySales authorId={author.author_id} /></section><Footer /></div>;
}
