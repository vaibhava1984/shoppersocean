import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth/requireUser";
import Dashboard from "../components/adminPage/Dashboard";
import AdminSidebar from "./adminSidebar";

export default async function AdminDashboard() {
  const identity = await requireAdmin();
  if (!identity) redirect("/");
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Dashboard />
      </main>
    </div>
  );
}
