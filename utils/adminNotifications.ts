export type AdminNotificationType = "account_created" | "account_deleted" | "purchase" | "book_review";

const NOTIFICATION_RETENTION_MS = 24 * 60 * 60 * 1000;

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

/** Delete notification records older than 24 hours from D1. */
export async function deleteExpiredAdminNotifications(db: any) {
  const cutoff = new Date(Date.now() - NOTIFICATION_RETENTION_MS).toISOString();
  await db.prepare("DELETE FROM admin_notifications WHERE created_at <= ?").bind(cutoff).run();
}

export async function addAdminNotification(
  db: any,
  notification: { type: AdminNotificationType; title: string; message: string; details?: Record<string, unknown> }
) {
  try {
    await ensureAdminNotificationsTable(db);
    await deleteExpiredAdminNotifications(db);
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
