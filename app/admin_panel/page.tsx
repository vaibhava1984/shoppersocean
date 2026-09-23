import React from 'react'
import { redirect } from "next/navigation"
import Dashboard from '../components/adminPage/Dashboard';
import AdminSidebar from "./adminSidebar"
import { createClient } from "@/utils/supabase/server";
import { getMigrationAuthUser } from "@/cloudflare/auth/nextjs-user";

export default async function AdminDashboard() {
    const clerkEnabled =
        process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
        Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
        Boolean(process.env.CLERK_SECRET_KEY);

    if (clerkEnabled) {
        const user = await getMigrationAuthUser();
        if (!user?.d1User || user.d1User.role !== "admin") redirect("/");
    } else {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole !== "ADMIN") redirect("/");
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Dashboard />
            </main>
        </div>
    )
}