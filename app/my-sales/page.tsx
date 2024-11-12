import Header from "@/components/Header";
import Footer from "@/components/Footer"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"
import MySales from './mySales';

export const metadata = {
    title: 'My Sales',
    description: 'My Sales',
}

export default async function MySalesPage() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/")
    };

    if (user?.app_metadata?.isAuthor !== true) {
        redirect("/")
    }

    const { data: currentAuthorDetails, error: currentAuthorDetailsError } = await supabase.from('authors').select(`
        *
     `).eq('id', user.id).single();

    if (!currentAuthorDetails?.author_id) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-20 bg-white">
                <MySales authorId={currentAuthorDetails?.author_id} />
            </section>
            <Footer />
        </div>
    )
}