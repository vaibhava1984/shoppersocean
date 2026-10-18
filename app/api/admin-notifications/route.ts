import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { ensureAdminNotificationsTable } from "@/utils/adminNotifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    await ensureAdminNotificationsTable(db);
    const { results = [] } = await db.prepare(
      "SELECT id,type,title,message,details,created_at,read_at FROM admin_notifications ORDER BY created_at DESC LIMIT 100"
    ).all();
    return NextResponse.json({ notifications: results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin notifications GET failed:", error);
    return NextResponse.json({ error: "Unable to load notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    await ensureAdminNotificationsTable(db);
    const body = await request.json().catch(() => ({}));
    if (body?.markAllRead === true) {
      await db.prepare("UPDATE admin_notifications SET read_at=? WHERE read_at IS NULL").bind(new Date().toISOString()).run();
      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Admin notifications PATCH failed:", error);
    return NextResponse.json({ error: "Unable to update notifications" }, { status: 500 });
  }
}
