import Header from "@/components/Header";
import Footer from "@/components/Footer"
import Settings from './Settings';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"

export const metadata = {
    title: 'My Settings',
    description: 'My Settings',
}

export default async function SettingsPage() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/")
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-10 bg-white">
                <Settings />
            </section>
            <Footer />
        </div>
    )
}