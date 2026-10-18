export type AdminNotificationType = "account_created" | "account_deleted" | "purchase" | "book_review";

export async function ensureAdminNotificationsTable(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL,
    read_at TEXT
  )`).run();
}

export async function addAdminNotification(
  db: D1Database,
  notification: { type: AdminNotificationType; title: string; message: string; details?: Record<string, unknown> }
) {
  try {
    await ensureAdminNotificationsTable(db);
    await db.prepare(
      "INSERT INTO admin_notifications (id,type,title,message,details,created_at,read_at) VALUES (?,?,?,?,?,?,NULL)"
    ).bind(
      crypto.randomUUID(),
      notification.type,
      notification.title.slice(0, 160),
      notification.message.slice(0, 500),
      JSON.stringify(notification.details ?? {}),
      new Date().toISOString()
    ).run();
  } catch (error) {
    // Notifications must never prevent account, review, or payment operations.
    console.error("Admin notification could not be saved:", error);
  }
}
