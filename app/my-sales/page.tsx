import Header from "@/components/Header";
import Footer from "@/components/Footer"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"
import MySales from './mySales';
import { getMigrationAuthUser } from "@/cloudflare/auth/nextjs-user";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthorByUserId } from "@/cloudflare/db/authors";

export const metadata = {
    title: 'My Sales',
    description: 'My Sales',
}

export default async function MySalesPage() {
    const clerkEnabled =
        process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
        Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
        Boolean(process.env.CLERK_SECRET_KEY);

    if (clerkEnabled) {
        const user = await getMigrationAuthUser();
        if (!user?.d1User || user.d1User.role !== "publisher") redirect("/");
        const { env } = getCloudflareContext();
        const author = await getAuthorByUserId(env, user.d1User.id);
        if (!author?.author_id) redirect("/");

        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Header />
                <section className="py-10 bg-white">
                    <MySales authorId={author.author_id} />
                </section>
                <Footer />
            </div>
        )
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user?.app_metadata?.isAuthor !== true) redirect("/");
    const { data: currentAuthorDetails } = await supabase.from('authors').select('*').eq('user_id', user.id).single();
    if (!currentAuthorDetails?.author_id) redirect("/");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-10 bg-white">
                <MySales authorId={currentAuthorDetails.author_id} />
            </section>
            <Footer />
        </div>
    )
}