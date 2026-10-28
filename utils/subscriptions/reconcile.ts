import { ensureSubscriptionSchema } from "./schema";
import { activatePaidSubscription } from "./activate";

function basicAuth(id: string, secret: string) {
  return "Basic " + btoa(id + ":" + secret);
}

export async function reconcilePendingSubscriptions(db: any, config: { keyId: string; keySecret: string; apiKey: string }) {
  if (!db) throw new Error("Cloudflare D1 binding is missing for subscription reconciliation.");
  await ensureSubscriptionSchema(db);
  const pending = await db.prepare(
    "SELECT id,user_id,plan_id,amount,currency,razorpay_order_id FROM subscription_orders " +
    "WHERE status='pending' AND created_at>? ORDER BY created_at ASC LIMIT 50"
  ).bind(new Date(Date.now() - 7 * 86400000).toISOString()).all<any>();
  if (!(pending.results ?? []).length) return { checked: 0, activated: 0, failed: 0 };
  if (!config.keyId || !config.keySecret) {
    console.error("Pending subscription payments exist but Razorpay credentials are unavailable for reconciliation.");
    return { checked: (pending.results ?? []).length, activated: 0, failed: (pending.results ?? []).length };
  }
  let activated = 0;
  let failed = 0;
  for (const saved of pending.results ?? []) {
    const orderId = String(saved.razorpay_order_id || "");
    if (!orderId) continue;
    try {
      const [orderResponse, paymentsResponse] = await Promise.all([
        fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
          headers: { Authorization: basicAuth(config.keyId, config.keySecret) }, cache: "no-store"
        }),
        fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}/payments`, {
          headers: { Authorization: basicAuth(config.keyId, config.keySecret) }, cache: "no-store"
        })
      ]);
      if (!orderResponse.ok || !paymentsResponse.ok) throw new Error("Razorpay order/payment lookup failed.");
      const order = await orderResponse.json() as Record<string, any>;
      const paymentCollection = await paymentsResponse.json() as Record<string, any>;
      const items = Array.isArray(paymentCollection.items) ? paymentCollection.items : [];
      const captured = items.find((p: any) => String(p?.status || "").toLowerCase() === "captured" || p?.captured === true);
      if (!captured) continue;
      if (
        order.id !== orderId ||
        String(order.notes?.purchase_type || "") !== "subscription" ||
        String(order.notes?.user_id || "") !== String(saved.user_id) ||
        String(order.notes?.plan_id || "") !== String(saved.plan_id) ||
        Number(order.amount) !== Number(saved.amount) * 100 ||
        Number(captured.amount) !== Number(saved.amount) * 100 ||
        String(order.currency || "").toUpperCase() !== "INR" ||
        String(captured.currency || "").toUpperCase() !== "INR" ||
        String(captured.order_id || "") !== orderId ||
        String(saved.currency || "").toUpperCase() !== "INR"
      ) {
        throw new Error("Captured payment did not match the saved subscription plan.");
      }
      await activatePaidSubscription(db, {
        razorpayOrderId: orderId,
        paymentId: String(captured.id),
        apiKey: config.apiKey,
      });
      activated++;
    } catch (error) {
      failed++;
      console.error("Pending subscription reconciliation failed for order", orderId, error);
    }
  }
  return { checked: (pending.results ?? []).length, activated, failed };
}
