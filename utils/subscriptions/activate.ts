import { addMonthsKeepingMonthEnd, ensureSubscriptionSchema } from "@/utils/subscriptions/schema";
import { sendSubscriptionWelcome } from "@/utils/subscriptions/email";

export async function activatePaidSubscription(db: any, input: { razorpayOrderId: string; paymentId: string; apiKey: string }) {
  await ensureSubscriptionSchema(db);
  const order = await db.prepare("SELECT * FROM subscription_orders WHERE razorpay_order_id=? LIMIT 1").bind(input.razorpayOrderId).first<any>();
  if (!order) throw new Error("Subscription order was not found.");
  if (String(order.razorpay_payment_id || input.paymentId) !== input.paymentId) throw new Error("Payment ID does not match this subscription order.");
  const now = new Date();
  const nowIso = now.toISOString();
  let startedAt = nowIso;
  let expiresAt = "";
  if (String(order.status).toLowerCase() === "completed") {
    const current = await db.prepare("SELECT started_at, expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(order.user_id).first<any>();
    startedAt = String(order.subscription_started_at || current?.started_at || nowIso);
    expiresAt = String(order.subscription_expires_at || current?.expires_at || "");
  } else {
    const current = await db.prepare("SELECT status, started_at, expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(order.user_id).first<any>();
    const activeFuture = String(current?.status || "").toLowerCase() === "active" && current?.expires_at && Date.parse(current.expires_at) > now.getTime();
    const effectiveStart = activeFuture ? new Date(String(current.expires_at)) : now;
    startedAt = effectiveStart.toISOString();
    expiresAt = addMonthsKeepingMonthEnd(effectiveStart, Number(order.months)).toISOString();
    await db.prepare("INSERT INTO user_subscriptions(user_id,status,started_at,expires_at,updated_at,plan_name,amount,payment_id,reminder_sent_for) VALUES(?,?,?,?,?,?,?,?,NULL) ON CONFLICT(user_id) DO UPDATE SET status='active',started_at=excluded.started_at,expires_at=excluded.expires_at,updated_at=excluded.updated_at,plan_name=excluded.plan_name,amount=excluded.amount,payment_id=excluded.payment_id,reminder_sent_for=NULL")
      .bind(order.user_id, "active", startedAt, expiresAt, nowIso, order.plan_name, Number(order.amount), input.paymentId).run();
    await db.prepare("UPDATE subscription_orders SET status='completed',razorpay_payment_id=?,subscription_started_at=?,subscription_expires_at=?,updated_at=? WHERE id=?")
      .bind(input.paymentId, startedAt, expiresAt, nowIso, order.id).run();
  }
  const final = await db.prepare("SELECT email_sent_at FROM subscription_orders WHERE id=? LIMIT 1").bind(order.id).first<any>();
  if (!final?.email_sent_at) {
    const profile = await db.prepare("SELECT email,full_name FROM users WHERE id=? LIMIT 1").bind(order.user_id).first<any>();
    if (profile?.email && input.apiKey) {
      await sendSubscriptionWelcome({ apiKey: input.apiKey, email: String(profile.email), name: String(profile.full_name || ""), planName: String(order.plan_name), amount: Number(order.amount), startedAt, expiresAt, paymentId: input.paymentId });
      await db.prepare("UPDATE subscription_orders SET email_sent_at=?,updated_at=? WHERE id=? AND email_sent_at IS NULL").bind(nowIso, nowIso, order.id).run();
    }
  }
  return { success: true, status: "active", planName: String(order.plan_name), amount: Number(order.amount), startedAt, expiresAt };
}
