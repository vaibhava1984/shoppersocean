import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth/requireUser";
import AdminAccordion from "./AdminAccordion";

export default async function AdminDashboard() {
  const identity = await requireAdmin();
  if (!identity) redirect("/");
  return (
    <div className="m-0 h-[100dvh] w-full overflow-hidden bg-white p-0">
      <AdminAccordion />
    </div>
  );
}
