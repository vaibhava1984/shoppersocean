import Header from "@/components/Header";
import Footer from "@/components/Footer"
import { createClient } from "@/utils/db/server";
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

    const { data: authorRows } = await supabase.from("authors").select("author_id").eq("user_id", user.id).limit(1);
    if (!authorRows?.[0]?.author_id) {
        redirect("/")
    }

    // console.log("user 1===>", user)

    const { data: currentAuthorDetails, error: currentAuthorDetailsError } = await supabase.from('authors').select(`
        *
     `).eq('user_id', user.id).single();

    // console.log("currentAuthorDetails 111111111===>", currentAuthorDetails)

    if (!currentAuthorDetails?.author_id) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-10 bg-white">
                <MySales authorId={currentAuthorDetails?.author_id} />
            </section>
            <Footer />
        </div>
    )
}