import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { activatePaidSubscription } from "@/utils/subscriptions/activate";
import { ensureSubscriptionSchema } from "@/utils/subscriptions/schema";
import { getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function basicAuth(id: string, secret: string) { return "Basic " + btoa(id + ":" + secret); }
function hexToBytes(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const bytes = hexToBytes(signature);
  if (!bytes) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(orderId + "|" + paymentId));
}

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Please sign in again to verify your payment." }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const paypalOrderId = String(body?.paypal_order_id || "");
    if (paypalOrderId) {
      const db = getD1();
      if (!db) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
      await ensureSubscriptionSchema(db);
      const saved = await db.prepare("SELECT * FROM subscription_orders WHERE razorpay_order_id=? AND user_id=? LIMIT 1").bind(paypalOrderId, identity.profile.id).first<any>();
      if (!saved || String(saved.currency).toUpperCase() !== "USD") return NextResponse.json({ error: "This PayPal order does not belong to your account." }, { status: 403 });
      const token = await getPaypalAccessToken();
      const captureResponse = await fetch(paypalApiUrl(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`), { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store" });
      let paypalOrder = await captureResponse.json().catch(() => ({})) as Record<string, any>;
      if (!captureResponse.ok) {
        const check = await fetch(paypalApiUrl(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        paypalOrder = await check.json().catch(() => ({})) as Record<string, any>;
        if (!check.ok || paypalOrder.status !== "COMPLETED") return NextResponse.json({ error: "PayPal could not confirm this payment yet." }, { status: 502 });
      }
      const unit = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units[0] : null;
      const capture = unit?.payments?.captures?.find((item: any) => item?.status === "COMPLETED");
      if (paypalOrder.status !== "COMPLETED" || String(unit?.custom_id || "") !== `${identity.profile.id}|${saved.plan_id}` || !capture?.id || String(capture.amount?.currency_code || "").toUpperCase() !== "USD" || Math.abs(Number(capture.amount?.value) - Number(saved.amount)) > 0.001) return NextResponse.json({ error: "The PayPal payment does not match your selected subscription plan." }, { status: 409 });
      const { env } = await getCloudflareContext();
      const apiKey = String((env as any).RESEND_API_KEY || process.env.RESEND_API_KEY || "");
      const activated = await activatePaidSubscription(db, { razorpayOrderId: paypalOrderId, paymentId: String(capture.id), apiKey });
      return NextResponse.json(activated, { headers: { "Cache-Control": "no-store" } });
    }
    const orderId = String(body?.razorpay_order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "Payment verification details are incomplete." }, { status: 400 });

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
    await ensureSubscriptionSchema(db);
    const saved = await db.prepare("SELECT * FROM subscription_orders WHERE razorpay_order_id=? AND user_id=? LIMIT 1").bind(orderId, identity.profile.id).first<any>();
    if (!saved) return NextResponse.json({ error: "This payment order does not belong to your account." }, { status: 403 });

    const { env } = await getCloudflareContext();
    const keyId = String((env as any).RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "");
    const keySecret = String((env as any).RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "");
    if (!keyId || !keySecret) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    if (!(await verifySignature(orderId, paymentId, signature, keySecret))) return NextResponse.json({ error: "The payment signature could not be verified." }, { status: 400 });

    const [orderResponse, paymentResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: basicAuth(keyId, keySecret) }, cache: "no-store" }),
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: basicAuth(keyId, keySecret) }, cache: "no-store" }),
    ]);
    const order = await orderResponse.json() as Record<string, any>;
    const payment = await paymentResponse.json() as Record<string, any>;
    if (!orderResponse.ok || !paymentResponse.ok || order.id !== orderId || payment.id !== paymentId) return NextResponse.json({ error: "Razorpay could not confirm this payment yet. Please contact support if money was deducted." }, { status: 502 });
    if (String(order.notes?.purchase_type) !== "subscription" || String(order.notes?.user_id) !== identity.profile.id || String(order.notes?.plan_id) !== String(saved.plan_id)) return NextResponse.json({ error: "The payment does not match this subscription order." }, { status: 409 });
    if (Number(order.amount) !== Number(saved.amount) * 100 || String(order.currency).toUpperCase() !== "INR" || Number(payment.amount) !== Number(saved.amount) * 100 || String(payment.currency).toUpperCase() !== "INR" || String(payment.order_id) !== orderId) return NextResponse.json({ error: "The payment amount does not match your selected plan." }, { status: 409 });
    if (String(payment.status).toLowerCase() !== "captured" && payment.captured !== true) return NextResponse.json({ error: "Your payment is still being confirmed. Please wait a moment and check your subscription status before paying again.", status: "processing" }, { status: 409 });

    const apiKey = String((env as any).RESEND_API_KEY || process.env.RESEND_API_KEY || "");
    const activated = await activatePaidSubscription(db, { razorpayOrderId: orderId, paymentId, apiKey });
    return NextResponse.json(activated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Subscription payment verification failed:", error);
    return NextResponse.json({ error: "We could not finish verifying the subscription. If your payment was deducted, please contact support before trying again." }, { status: 500 });
  }
}
