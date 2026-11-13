import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { addMonthsKeepingMonthEnd, ensureSubscriptionSchema, SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/utils/subscriptions/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const identity = await requireAdmin();
    if (!identity) return NextResponse.json({ error: "Only an administrator can assign a subscription." }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const planId = String(body?.planId || "") as SubscriptionPlanId;
    const plan = SUBSCRIPTION_PLANS[planId];
    const startDate = String(body?.startedAt || "");
    if (!plan) return NextResponse.json({ error: "Please select a valid subscription plan." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return NextResponse.json({ error: "Please select a valid plan start date." }, { status: 400 });

    const [year, month, day] = startDate.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));
    if (start.getUTCFullYear() !== year || start.getUTCMonth() !== month - 1 || start.getUTCDate() !== day) {
      return NextResponse.json({ error: "The selected start date is not valid." }, { status: 400 });
    }

    const expiry = addMonthsKeepingMonthEnd(start, plan.months);
    const startedAt = start.toISOString();
    const expiresAt = expiry.toISOString();
    const now = new Date().toISOString();
    const status = expiry.getTime() > Date.now() ? "active" : "inactive";

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
    await ensureSubscriptionSchema(db);
    await db.prepare(
      "INSERT INTO user_subscriptions(user_id,status,started_at,expires_at,updated_at,plan_name,amount,payment_id,reminder_sent_for) VALUES(?,?,?,?,?,?,?,NULL,NULL) ON CONFLICT(user_id) DO UPDATE SET status=excluded.status,started_at=excluded.started_at,expires_at=excluded.expires_at,updated_at=excluded.updated_at,plan_name=excluded.plan_name,amount=excluded.amount,payment_id=NULL,reminder_sent_for=NULL"
    ).bind(identity.profile.id, status, startedAt, expiresAt, now, plan.name, plan.amount).run();

    return NextResponse.json({
      success: true,
      subscription: {
        status,
        planName: plan.name,
        amount: plan.amount,
        startedAt,
        expiresAt,
        daysRemaining: Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86400000)),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin subscription assignment failed:", error);
    return NextResponse.json({ error: "Could not save the subscription. Please try again." }, { status: 500 });
  }
}
