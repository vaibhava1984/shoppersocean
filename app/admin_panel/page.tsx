import React from "react";
import { redirect } from "next/navigation";
import Dashboard from "../components/adminPage/Dashboard";
import AdminSidebar from "./adminSidebar";
import { requireAdmin } from "@/utils/auth/requireUser";

export default async function AdminDashboard() {
  const user = await requireAdmin();
  if (!user) redirect("/");
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8"><Dashboard /></main>
    </div>
  );
}