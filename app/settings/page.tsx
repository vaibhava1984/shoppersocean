import Header from "@/components/Header";
import { getUser } from "@/utils/supabase/server";
import { getMigrationAuthUser } from "@/cloudflare/auth/nextjs-user";
import Footer from "@/components/Footer";
import Settings from "./Settings";
import ClerkSettings from "./ClerkSettings";

export const metadata = {
    title: 'My Settings',
    description: 'My Settings',
}

export default async function SettingsPage() {
    const clerkEnabled =
        process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
        Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
        Boolean(process.env.CLERK_SECRET_KEY);

    const user = clerkEnabled
        ? await getMigrationAuthUser()
        : await getUser();

    const settingsUser = clerkEnabled && user
        ? {
            id: user.clerkUserId,
            email: user.email,
            phone: user.d1User?.mobile ?? "",
            user_metadata: {
                full_name: user.fullName,
                country: user.d1User?.country ?? "",
                address: user.d1User?.address ?? "",
                mobile: user.d1User?.mobile ?? "",
            },
        }
        : user;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header user={settingsUser as any} />
            <section className="py-10 bg-white">
                {clerkEnabled ? <ClerkSettings initialUser={settingsUser} /> : <Settings initialUser={settingsUser} />}
            </section>
            <Footer />
        </div>
    )
}
