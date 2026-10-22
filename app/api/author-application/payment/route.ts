import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";

const INDIA_AMOUNT = 250;
const FOREIGN_AMOUNT = 5;
const BASE_URL = "https://www.shoppersocean.com";
const ADMIN_EMAIL = "kochimonu@gmail.com";

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2) return null;
  const out = new Uint8Array(value.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(value.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const bytes = hexToBytes(signature);
  if (!bytes) return false;
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(orderId + "|" + paymentId));
}

async function ensureColumns(db: D1Database) {
  for (const statement of [
    "ALTER TABLE author_applications ADD COLUMN approved_at TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_deadline TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_order_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_id TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_currency TEXT",
    "ALTER TABLE author_applications ADD COLUMN payment_amount REAL"
  ]) { try { await db.prepare(statement).run(); } catch {} }
}

async function expireApplication(db: D1Database, application: any, env: any) {
  if (application.status !== "approved_payment_pending") return false;
  if (!application.payment_deadline || new Date(application.payment_deadline).getTime() > Date.now()) return false;
  const now = new Date().toISOString();
  const updated = await db.prepare("UPDATE author_applications SET status='expired',reviewed_at=? WHERE id=? AND status='approved_payment_pending'")
    .bind(now, application.id).run();
  if (!updated.meta?.changes) return false;
  const resendKey = String(env.RESEND_API_KEY || "");
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "no-reply@shoppersocean.com",
        to: application.email,
        subject: "Shoppers Ocean Author Registration",
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${String(application.full_name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")},</p><p>Your Shoppers Ocean author registration payment was not completed within the three-day payment period, so the registration could not be finalized.</p><p>You are welcome to apply again if you wish to register as an author.</p><p>Regards,<br/>Shoppers Ocean</p></div>`,
      });
    } catch (e) { console.error("Author expiry email failed:", e); }
  }
  await db.prepare("DELETE FROM author_applications WHERE id=? AND status='expired'").bind(application.id).run();
  return true;
}

export async function GET() {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ status: "signed_out" }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });
    const { env } = await getCloudflareContext();
    await ensureColumns(db);
    let application = await db.prepare("SELECT * FROM author_applications WHERE user_id=? ORDER BY created_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    if (!application) return NextResponse.json({ status: "not_started" }, { headers: { "Cache-Control": "no-store" } });
    if (await expireApplication(db, application, env)) {
      application = await db.prepare("SELECT * FROM author_applications WHERE id=? LIMIT 1").bind(application.id).first<any>();
    }
    return NextResponse.json({
      status: application.status,
      paymentDeadline: application.payment_deadline || null,
      country: application.country,
      title: application.title || "",
      fullName: application.full_name || "",
      email: application.email || "",
      city: application.city || "",
      age: application.age || null,
      gender: application.gender || "",
      paypalId: application.paypal_id || "",
      upiNumber: application.upi_number || "",
      amount: application.country === "India" ? INDIA_AMOUNT : FOREIGN_AMOUNT,
      currency: application.country === "India" ? "INR" : "USD",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Author payment status error:", e);
    return NextResponse.json({ error: "Unable to read author registration status." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });
    const { env } = await getCloudflareContext();
    await ensureColumns(db);

    const application = await db.prepare("SELECT * FROM author_applications WHERE user_id=? ORDER BY created_at DESC LIMIT 1").bind(identity.profile.id).first<any>();
    if (!application) return NextResponse.json({ error: "No author application was found." }, { status: 404 });

    if (application.status === "completed") return NextResponse.json({ success: true, status: "completed" });
    if (application.status !== "approved_payment_pending") return NextResponse.json({ error: "Your author application is not currently awaiting payment.", status: application.status }, { status: 409 });
    if (await expireApplication(db, application, env)) return NextResponse.json({ error: "The three-day payment period has expired. Your author registration could not be completed.", status: "expired" }, { status: 410 });

    const keyId = String(env.RAZORPAY_KEY_ID || "");
    const keySecret = String(env.RAZORPAY_KEY_SECRET || "");
    if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay payment service is not configured." }, { status: 503 });

    const country = String(application.country || "");
    const currency = country === "India" ? "INR" : "USD";
    const amount = country === "India" ? INDIA_AMOUNT : FOREIGN_AMOUNT;
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || "create");

    if (action === "create") {
      const title = String(body?.title ?? application.title ?? "").trim();
      const fullName = String(body?.fullName ?? application.full_name ?? "").trim();
      const city = String(body?.city ?? application.city ?? "").trim();
      const age = Number(body?.age ?? application.age);
      const gender = String(body?.gender ?? application.gender ?? "").trim();
      const paypalId = String(body?.paypalId ?? application.paypal_id ?? "").trim();
      const upiNumber = String(body?.upiNumber ?? application.upi_number ?? "").trim();

      if (!title || !fullName || !city || !gender || !Number.isInteger(age) || age < 1 || age > 120) {
        return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
      }
      if (country === "India" && !upiNumber) {
        return NextResponse.json({ error: "Please provide your UPI-connected mobile number." }, { status: 400 });
      }
      if (country !== "India" && !paypalId) {
        return NextResponse.json({ error: "Please provide your PayPal ID." }, { status: 400 });
      }

      await db.prepare("UPDATE author_applications SET title=?,full_name=?,city=?,age=?,gender=?,paypal_id=?,upi_number=? WHERE id=? AND status='approved_payment_pending'")
        .bind(title, fullName, city, age, gender, country === "India" ? null : paypalId, country === "India" ? upiNumber : null, application.id).run();
    }

    if (action === "verify") {
      const orderId = String(body?.razorpay_order_id || "");
      const paymentId = String(body?.razorpay_payment_id || "");
      const signature = String(body?.razorpay_signature || "");
      if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "Payment verification information is incomplete." }, { status: 400 });
      if (application.payment_order_id && application.payment_order_id !== orderId) return NextResponse.json({ error: "Payment order does not match this author application." }, { status: 409 });
      if (!(await verifySignature(orderId, paymentId, signature, keySecret))) return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });

      const paymentResponse = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId), { headers: { Authorization: basicAuth(keyId, keySecret) } });
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok || !payment?.id) return NextResponse.json({ error: "Unable to verify payment with Razorpay." }, { status: 502 });
      if (String(payment.order_id || "") !== orderId || Number(payment.amount) !== Math.round(amount * 100) || String(payment.currency || "").toUpperCase() !== currency) {
        return NextResponse.json({ error: "Payment does not match the author registration fee." }, { status: 400 });
      }
      if (String(payment.status || "") !== "captured") return NextResponse.json({ error: "Payment has not been completed yet. Please complete the payment and try again." }, { status: 409 });

      const now = new Date().toISOString();
      const existingAuthor = await db.prepare("SELECT id FROM authors WHERE user_id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(application.user_id).first();
      if (!existingAuthor) {
        await db.prepare("INSERT INTO authors(id,name,bio,user_id,is_deleted,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
          .bind(crypto.randomUUID(), application.full_name, "-", application.user_id, 0, now, now).run();
      }
      await db.prepare("UPDATE author_applications SET status='completed',payment_order_id=?,payment_id=?,payment_currency=?,payment_amount=?,reviewed_at=? WHERE id=? AND status='approved_payment_pending'")
        .bind(orderId, paymentId, currency, amount, now, application.id).run();

      const resendKey = String(env.RESEND_API_KEY || "");
      if (resendKey) {
        const safeName = String(application.full_name || "Author").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        const emailBody = `<div style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;"><div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbeafe;"><div style="padding:28px 24px;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#ffffff;text-align:center;"><h1 style="margin:0;font-size:26px;">Welcome to Shoppers Ocean!</h1><p style="margin:10px 0 0;font-size:17px;">Your author journey begins here</p></div><div style="padding:28px 26px;line-height:1.8;"><p>Dear ${safeName},</p><h2 style="color:#15803d;">Congratulations on becoming a registered author! 🎉</h2><p>Your registration payment has been successfully verified, and your author registration with Shoppers Ocean is now complete.</p><p>We are delighted to welcome you to our community. We look forward to seeing your creativity reach readers around the world.</p><p style="margin-top:28px;">Warm regards,<br/><strong>The Shoppers Ocean Team</strong></p></div></div></div>`;
        const resend = new Resend(resendKey);
        const emailResults = await Promise.allSettled([
          resend.emails.send({ from: "no-reply@shoppersocean.com", to: application.email, subject: "Welcome to Shoppers Ocean — Your Author Registration Is Complete 🎉", html: emailBody }),
          resend.emails.send({ from: "no-reply@shoppersocean.com", to: ADMIN_EMAIL, subject: "New Registered Author — Shoppers Ocean", html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#1e293b;"><h2 style="color:#15803d;">Author registration completed successfully</h2><p>A new author has completed the registration payment.</p><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${String(application.email || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p><p><strong>Country:</strong> ${String(application.country || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p><p><strong>Payment:</strong> ${currency} ${amount}</p><p>The author has been added to the Authors list and appears as Registered Author in Author Approval.</p><p>Regards,<br/>Shoppers Ocean</p></div>` }),
        ]);
        emailResults.forEach((result) => { if (result.status === "rejected") console.error("Author registration email failed:", result.reason); else if (result.value?.error) console.error("Author registration email error:", result.value.error); });
      }
      return NextResponse.json({ success: true, status: "completed" });
    }

    const receipt = "author_" + crypto.randomUUID().replace(/-/g, "").slice(0, 25);
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: basicAuth(keyId, keySecret), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes: { user_id: identity.profile.id, author_application_id: application.id, purpose: "shoppers_ocean_author_registration" }
      }),
    });
    const order = await orderResponse.json();
    if (!orderResponse.ok || !order?.id) return NextResponse.json({ error: "Unable to create the author registration payment order." }, { status: 502 });

    await db.prepare("UPDATE author_applications SET payment_order_id=?,payment_currency=?,payment_amount=? WHERE id=? AND status='approved_payment_pending'")
      .bind(order.id, currency, amount, application.id).run();

    return NextResponse.json({ orderId: order.id, amount, currency }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Author payment error:", e);
    return NextResponse.json({ error: "Unable to process author registration payment." }, { status: 500 });
  }
}
