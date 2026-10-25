import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";
import AuthorPanelClient from "./panel";

export const dynamic = "force-dynamic";
export default async function AuthorPanelPage() {
 const user = await getCurrentUser();
 if (!user) redirect("/");
 if (String(user.publicMetadata.userrole || "").toUpperCase() === "ADMIN") redirect("/admin_panel");
 const db = getD1();
 if (!db) redirect("/");
 const author = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(user.id).first<any>();
 if (!author) redirect("/");
 return <AuthorPanelClient />;
}
