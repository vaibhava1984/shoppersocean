import React from 'react'
import { redirect } from "next/navigation"
import Dashboard from '../components/adminPage/Dashboard';
import AdminSidebar from "./adminSidebar"
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";

export default async function AdminDashboard() {
    const user: any = await getFirebaseUser();
    if (!user) redirect("/");
    let role = user.userrole || user.role;
    if (role !== "ADMIN") {
        const profile = await firestore.collection("profiles").doc(user.uid).get();
        role = profile.exists ? profile.data()?.userrole : role;
    }
    if (role !== "ADMIN") redirect("/");
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Dashboard />
            </main>
        </div>
    )
}
