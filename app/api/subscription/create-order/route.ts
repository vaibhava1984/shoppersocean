import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureSubscriptionSchema, SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/utils/subscriptions/schema";
import { getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function basicAuth(id: string, secret: string) { return "Basic " + btoa(id + ":" + secret); }

function isIndia(request: Request) { return String(request.headers.get("cf-ipcountry") || "").trim().toUpperCase() === "IN"; }

export async function GET(request: Request) { const currency = isIndia(request) ? "INR" : "USD"; return NextResponse.json({ currency, plans: Object.values(SUBSCRIPTION_PLANS).map(plan => ({ id: plan.id, amount: currency === "INR" ? plan.amount : plan.usdAmount })) }, { headers: { "Cache-Control": "no-store" } }); }

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
    if (!isIndia(request)) {
      const token = await getPaypalAccessToken();
      const amount = Number(plan.usdAmount).toFixed(2);
      const origin = new URL(request.url).origin;
      const response = await fetch(paypalApiUrl("/v2/checkout/orders"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{ custom_id: `${identity.profile.id}|${plan.id}`, description: `${plan.name} Shoppers Ocean Entertainment Subscription`, amount: { currency_code: "USD", value: amount } }],
          application_context: { brand_name: "Shoppers Ocean", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: `${origin}/subscribe-now?paypal_subscription_order={order_id}`, cancel_url: `${origin}/subscribe-now?paypal_cancelled=1` }
        }),
        cache: "no-store"
      });
      const paypalOrder = await response.json() as Record<string, any>;
      const approvalUrl = Array.isArray(paypalOrder.links) ? paypalOrder.links.find((link: any) => link.rel === "approve")?.href : "";
      if (!response.ok || !paypalOrder.id || !approvalUrl) return NextResponse.json({ error: "We could not start PayPal checkout. Please try again." }, { status: 502 });
      const now = new Date().toISOString();
      try {
        await db.prepare("INSERT INTO subscription_orders(id,user_id,plan_id,plan_name,months,amount,currency,razorpay_order_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,'USD',?,'pending',?,?)")
          .bind(crypto.randomUUID(), identity.profile.id, plan.id, plan.name, plan.months, Number(plan.usdAmount), String(paypalOrder.id), now, now).run();
      } catch (error) {
        console.error("Could not save PayPal subscription order:", error);
        return NextResponse.json({ error: "We could not safely prepare your subscription. No checkout was opened." }, { status: 503 });
      }
      return NextResponse.json({ provider: "paypal", orderId: String(paypalOrder.id), approvalUrl, amount, currency: "USD" }, { headers: { "Cache-Control": "no-store" } });
    }

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
