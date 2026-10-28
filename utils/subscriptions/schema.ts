export const SUBSCRIPTION_PLANS = {
  "1-month": { id: "1-month", name: "1 Month", months: 1, amount: 299 },
  "3-months": { id: "3-months", name: "3 Months", months: 3, amount: 850 },
  "6-months": { id: "6-months", name: "6 Months", months: 6, amount: 1550 },
  "12-months": { id: "12-months", name: "12 Months", months: 12, amount: 3000 },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

export async function ensureSubscriptionSchema(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS user_subscriptions (
    user_id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'inactive',
    started_at TEXT,
    expires_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  for (const statement of [
    "ALTER TABLE user_subscriptions ADD COLUMN plan_name TEXT",
    "ALTER TABLE user_subscriptions ADD COLUMN amount INTEGER",
    "ALTER TABLE user_subscriptions ADD COLUMN payment_id TEXT",
    "ALTER TABLE user_subscriptions ADD COLUMN reminder_sent_for TEXT",
    `CREATE TABLE IF NOT EXISTS subscription_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      months INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      razorpay_order_id TEXT NOT NULL UNIQUE,
      razorpay_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      email_sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    "CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_created ON subscription_orders(user_id, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry ON user_subscriptions(status, expires_at)"
  ]) {
    try { await db.prepare(statement).run(); }
    catch (error) {
      const message = String(error).toLowerCase();
      if (!message.includes("duplicate column") && !message.includes("already exists")) throw error;
    }
  }
}

export function addMonthsKeepingMonthEnd(value: Date, months: number) {
  const day = value.getUTCDate();
  const result = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1, value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}
