import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureSubscriptionSchema, SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/utils/subscriptions/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function basicAuth(id: string, secret: string) { return "Basic " + btoa(id + ":" + secret); }

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in before subscribing." }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const planId = String(body?.planId || "") as SubscriptionPlanId;
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) return NextResponse.json({ error: "Please choose one of the available subscription plans." }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
    await ensureSubscriptionSchema(db);
    const { env } = await getCloudflareContext();
    const keyId = String((env as any).RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "");
    const keySecret = String((env as any).RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "");
    if (!keyId || !keySecret) return NextResponse.json({ error: "The payment service is not configured yet. Please contact Shoppers Ocean support." }, { status: 503 });

    const receipt = "sub_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: basicAuth(keyId, keySecret), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: plan.amount * 100,
        currency: "INR",
        receipt,
        notes: { purchase_type: "subscription", user_id: identity.profile.id, plan_id: plan.id, plan_name: plan.name, months: plan.months, base_amount: plan.amount },
      }),
    });
    const order = await response.json() as Record<string, any>;
    if (!response.ok || !order.id) {
      console.error("Razorpay subscription order creation failed:", order);
      return NextResponse.json({ error: "We could not start checkout. Please try again." }, { status: 502 });
    }

    const now = new Date().toISOString();
    try {
      await db.prepare("INSERT INTO subscription_orders(id,user_id,plan_id,plan_name,months,amount,currency,razorpay_order_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,'INR',?,'pending',?,?)")
        .bind(crypto.randomUUID(), identity.profile.id, plan.id, plan.name, plan.months, plan.amount, String(order.id), now, now).run();
    } catch (error) {
      console.error("Could not save pending subscription order:", error);
      return NextResponse.json({ error: "We could not safely prepare your subscription. No checkout was opened; please try again." }, { status: 503 });
    }
    return NextResponse.json({
      keyId, orderId: String(order.id), amount: plan.amount * 100, currency: "INR",
      name: "Shoppers Ocean", description: `${plan.name} Subscription`,
      prefill: { name: identity.profile.full_name || "", email: identity.profile.email || "" },
      plan: { id: plan.id, name: plan.name, amount: plan.amount, months: plan.months },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Subscription checkout setup failed:", error);
    return NextResponse.json({ error: "Unable to prepare checkout. Please try again." }, { status: 500 });
  }
}
