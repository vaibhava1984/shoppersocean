import Header from "@/components/Header";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import Footer from "@/components/Footer";
import Settings from "./Settings";

export const metadata = { title: "My Settings", description: "My Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  let storedRole = "";
  if (user?.id) {
    const db = getD1();
    if (db) {
      const row = await db.prepare("SELECT role FROM users WHERE id = ? LIMIT 1").bind(user.id).first<{ role?: string }>();
      storedRole = String(row?.role ?? "");
    }
  }
  const roles = [user?.publicMetadata?.userrole ?? "", storedRole]
    .flatMap((value) => String(value).split(","))
    .map((role) => role.trim().toUpperCase());
  const isAdmin = roles.includes("ADMIN");
  const initialUser = user
    ? {
        email: user.emailAddresses?.[0]?.emailAddress ?? "",
        phone: user.phoneNumbers?.find((p) => p.verification?.status === "verified")?.phoneNumber ?? "",
        user_metadata: {
          full_name: user.firstName ?? "",
          country: (user.publicMetadata?.country as string) || "",
          address: (user.publicMetadata?.address as string) || "",
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="bg-white py-10">
        <Settings initialUser={initialUser} isAdmin={isAdmin} />
      </section>
      <Footer />
    </div>
  );
}
