import React from 'react'
import { redirect } from "next/navigation"
import Dashboard from '../components/adminPage/Dashboard';
import Orders from '../components/adminPage/Orders';
import AdminSidebar from "./adminSidebar"
import { createClient } from "@/utils/db/server";

export default async function AdminDashboard() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user?.app_metadata?.userrole !== "ADMIN") {
        redirect("/")
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