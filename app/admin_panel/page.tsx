import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth/requireUser";
import AdminAccordion from "./AdminAccordion";

export default async function AdminDashboard() {
  const identity = await requireAdmin();
  if (!identity) redirect("/");
  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-8">
      <AdminAccordion />
    </div>
  );
}
