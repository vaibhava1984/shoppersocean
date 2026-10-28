import { ensureSubscriptionSchema } from "./schema";
import { sendSubscriptionReminder } from "./email";

export async function runSubscriptionReminders(db: any, apiKey: string) {
  if (!db) throw new Error("Cloudflare D1 binding is missing.");
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured for subscription reminders.");
  await ensureSubscriptionSchema(db);
  const now = Date.now();
  // Hourly Cloudflare cron: send once when expiry is 2–3 days away.
  const lower = new Date(now + 2 * 86400000).toISOString();
  const upper = new Date(now + 3 * 86400000).toISOString();
  const rows = await db.prepare(
    "SELECT s.user_id,s.plan_name,s.expires_at,s.reminder_sent_for,u.email,u.full_name " +
    "FROM user_subscriptions s JOIN users u ON u.id=s.user_id " +
    "WHERE s.status='active' AND s.expires_at>? AND s.expires_at<=? " +
    "AND (s.reminder_sent_for IS NULL OR s.reminder_sent_for<>s.expires_at) " +
    "ORDER BY s.expires_at ASC LIMIT 100"
  ).bind(lower, upper).all<any>();
  let sent = 0;
  const failures: string[] = [];
  for (const row of rows.results ?? []) {
    if (!row.email || !row.expires_at) continue;
    try {
      await sendSubscriptionReminder({
        apiKey,
        email: String(row.email),
        name: String(row.full_name || ""),
        planName: String(row.plan_name || "Shoppers Ocean"),
        expiresAt: String(row.expires_at),
        userId: String(row.user_id),
      });
      await db.prepare("UPDATE user_subscriptions SET reminder_sent_for=? WHERE user_id=? AND status='active' AND expires_at=? AND (reminder_sent_for IS NULL OR reminder_sent_for<>?)")
        .bind(row.expires_at, row.user_id, row.expires_at, row.expires_at).run();
      sent++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Subscription reminder failed for user", row.user_id, message);
      failures.push(String(row.user_id));
    }
  }
  return { checked: (rows.results ?? []).length, sent, failed: failures.length };
}
