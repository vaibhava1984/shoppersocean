import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensurePaypalSchema, getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";
import { sendSaleNotification } from "@/utils/email/sendSaleNotification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function runtimeValue(env: any, key: string) {
  return String(env?.[key] || process.env[key] || "").trim();
}

async function verifyPaypalWebhook(
  accessToken: string,
  webhookId: string,
  headers: Headers,
  event: unknown
) {
  const transmissionId = headers.get("paypal-transmission-id") || "";
  const transmissionTime = headers.get("paypal-transmission-time") || "";
  const transmissionSignature = headers.get("paypal-transmission-sig") || "";
  const certUrl = headers.get("paypal-cert-url") || "";
  const authAlgo = headers.get("paypal-auth-algo") || "";

  if (!transmissionId || !transmissionTime || !transmissionSignature || !certUrl || !authAlgo) {
    return false;
  }

  const response = await fetch(paypalApiUrl("/v1/notifications/verify-webhook-signature"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSignature,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    console.error("PayPal webhook signature verification API failed:", response.status, result?.name);
    throw new Error("PayPal webhook signature verification could not be completed");
  }
  return result?.verification_status === "SUCCESS";
}

export async function POST(req: Request) {
  try {
    const { env } = getCloudflareContext();
    const runtimeEnv = env as any;
    const webhookId = runtimeValue(runtimeEnv, "PAYPAL_WEBHOOK_ID");
    if (!webhookId) {
      console.error("PAYPAL_WEBHOOK_ID is not configured");
      return NextResponse.json({ error: "PayPal webhook is not configured" }, { status: 503 });
    }

    const rawBody = await req.text();
    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const accessToken = await getPaypalAccessToken();
    const valid = await verifyPaypalWebhook(accessToken, webhookId, req.headers, event);
    if (!valid) {
      return NextResponse.json({ error: "Invalid PayPal webhook signature" }, { status: 401 });
    }

    // Acknowledge unrelated verified PayPal events without touching purchase records.
    if (event?.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const capture = event?.resource;
    const captureId = String(capture?.id || "");
    const orderId = String(capture?.supplementary_data?.related_ids?.order_id || "");
    if (!captureId || !orderId || String(capture?.status || "").toUpperCase() !== "COMPLETED") {
      return NextResponse.json({ error: "Completed PayPal capture is missing its order details" }, { status: 400 });
    }

    // Confirm the canonical PayPal order and capture before changing D1.
    const orderResponse = await fetch(paypalApiUrl(`/v2/checkout/orders/${encodeURIComponent(orderId)}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const paypalOrder = await orderResponse.json().catch(() => ({})) as Record<string, any>;
    if (!orderResponse.ok || paypalOrder?.status !== "COMPLETED") {
      console.error("Could not confirm completed PayPal order:", orderResponse.status);
      return NextResponse.json({ error: "PayPal order confirmation failed; retry webhook" }, { status: 503 });
    }

    const unit = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units[0] : null;
    const canonicalCapture = unit?.payments?.captures?.find((item: any) =>
      String(item?.id || "") === captureId && String(item?.status || "") === "COMPLETED"
    );
    if (!unit || !canonicalCapture || String(unit.custom_id || "").split("|").length !== 2) {
      return NextResponse.json({ error: "PayPal capture does not match its canonical order" }, { status: 409 });
    }

    const [userId, bookId] = String(unit.custom_id).split("|");
    const payerAddress = paypalOrder?.payer?.address || {};
    const shippingAddress = unit?.shipping?.address || {};
    const payerCountryCode = String(payerAddress?.country_code || shippingAddress?.country_code || "").toUpperCase();
    const validPayerCountry = /^[A-Z]{2}$/.test(payerCountryCode) ? payerCountryCode : null;
    const saleRegion = String(payerAddress?.admin_area_1 || shippingAddress?.admin_area_1 || "").trim().slice(0,120);
    const saleCity = String(payerAddress?.admin_area_2 || payerAddress?.city || shippingAddress?.admin_area_2 || shippingAddress?.city || "").trim().slice(0,120);
    const amount = Number(canonicalCapture.amount?.value);
    const currency = String(canonicalCapture.amount?.currency_code || "").toUpperCase();
    if (!userId || !bookId || currency !== "USD" || !Number.isFinite(amount) || amount <= 0 ||
        String(capture.amount?.currency_code || "").toUpperCase() !== currency ||
        Math.abs(Number(capture.amount?.value) - amount) > 0.001) {
      return NextResponse.json({ error: "PayPal capture amount or ownership details are invalid" }, { status: 409 });
    }

    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 503 });
    await ensurePaypalSchema(db);

    const savedOrder = await db.prepare(
      "SELECT id, user_id, book_id, amount, currency FROM orders WHERE paypal_order_id = ? LIMIT 1"
    ).bind(orderId).first<Record<string, any>>();
    if (!savedOrder) {
      console.error("Completed PayPal capture has no saved local order:", orderId);
      return NextResponse.json({ error: "Saved PayPal order not found; retry reconciliation" }, { status: 503 });
    }
    if (String(savedOrder.user_id) !== userId || String(savedOrder.book_id) !== bookId ||
        String(savedOrder.currency || "").toUpperCase() !== "USD" ||
        Math.abs(Number(savedOrder.amount) - amount) > 0.001) {
      return NextResponse.json({ error: "PayPal capture does not match the saved purchase" }, { status: 409 });
    }

    const book = await db.prepare(
      "SELECT id, title FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(bookId).first<Record<string, any>>();
    const customer = await db.prepare(
      "SELECT id, email, full_name FROM users WHERE id = ? LIMIT 1"
    ).bind(userId).first<Record<string, any>>();
    if (!book || !customer) {
      return NextResponse.json({ error: "Purchase customer or book record is missing" }, { status: 503 });
    }

    const now = new Date().toISOString();
    const existing = await db.prepare(
      "SELECT id, order_id, user_id, book_id FROM payments WHERE paypal_order_id = ? OR paypal_capture_id = ? LIMIT 1"
    ).bind(orderId, captureId).first<Record<string, any>>();

    if (existing) {
      if (String(existing.order_id) !== String(savedOrder.id) ||
          String(existing.user_id) !== userId || String(existing.book_id) !== bookId) {
        return NextResponse.json({ error: "Conflicting PayPal payment record exists" }, { status: 409 });
      }
      await db.prepare(
        "UPDATE payments SET status = 'completed', paypal_capture_id = ?, original_amount = ?, original_currency = 'USD', payment_method = 'PayPal', paypal_payer_country=COALESCE(?,paypal_payer_country), sale_country=COALESCE(NULLIF(sale_country,''),?), updated_at = ? WHERE id = ?"
      ).bind(captureId, amount, validPayerCountry, validPayerCountry, now, existing.id).run();
    } else {
      try {
        await db.prepare(
          "INSERT INTO payments (id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, paypal_order_id, paypal_capture_id, original_amount, original_currency, payment_method, paypal_payer_country, sale_country, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, ?, 'USD', 'completed', NULL, NULL, ?, ?, ?, 'USD', 'PayPal', ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), savedOrder.id, userId, bookId, amount, orderId, captureId, amount, validPayerCountry, validPayerCountry, now, now).run();
      } catch (insertError) {
        // A parallel browser callback may have inserted this exact payment first.
        const duplicate = await db.prepare(
          "SELECT id, order_id, user_id, book_id FROM payments WHERE paypal_order_id = ? OR paypal_capture_id = ? LIMIT 1"
        ).bind(orderId, captureId).first<Record<string, any>>();
        if (!duplicate || String(duplicate.order_id) !== String(savedOrder.id) ||
            String(duplicate.user_id) !== userId || String(duplicate.book_id) !== bookId) {
          throw insertError;
        }
      }
    }

    await db.prepare("UPDATE payments SET sale_country=COALESCE(NULLIF(sale_country,''),?),sale_region=COALESCE(NULLIF(sale_region,''),?),sale_city=COALESCE(NULLIF(sale_city,''),?) WHERE paypal_order_id=? OR paypal_capture_id=?")
      .bind(validPayerCountry,saleRegion || null,saleCity || null,orderId,captureId).run();

    await db.prepare(
      "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ? AND user_id = ?"
    ).bind(now, savedOrder.id, userId).run();

    // A 5xx response makes PayPal retry this event if the email provider is unavailable.
    // The shared payment ID idempotency key prevents browser/webhook duplicate emails.
    await sendSaleNotification({
      paymentId: captureId,
      paymentMethod: "PayPal",
      customerEmail: String(customer.email || ""),
      customerName: String(customer.full_name || ""),
      saleCountry: validPayerCountry,
      saleRegion,
      saleCity,
      bookId,
      bookTitle: String(book.title || ""),
    });

    return NextResponse.json({ received: true, status: "completed" }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("PayPal completed-capture webhook failed; PayPal should retry:", error);
    return NextResponse.json({ error: "PayPal webhook processing failed; retry delivery" }, { status: 500 });
  }
}
