import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensurePaypalSchema, getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INTERNATIONAL_PRICE_USD = "3.00";

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Prefer Cloudflare's visitor geolocation. The profile country is a fallback only.
    const country = String(
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      ""
    ).trim().toUpperCase();
    if (country === "IN" || country === "INDIA") {
      return NextResponse.json(
        { error: "Customers in India must use the existing Razorpay checkout." },
        { status: 400 }
      );
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 503 });
    }
    await ensurePaypalSchema(db);

    const body = await req.json().catch(() => ({}));
    const productId = String(body?.productId || "").trim();
    if (!productId) {
      return NextResponse.json({ error: "Book is required" }, { status: 400 });
    }

    const book = await db.prepare(
      "SELECT id, title, price FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(productId).first<Record<string, any>>();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const priceInINR = Number(book.price);
    if (!Number.isFinite(priceInINR) || priceInINR <= 0) {
      return NextResponse.json({ error: "This book does not have a valid price" }, { status: 400 });
    }

    const accessToken = await getPaypalAccessToken();
    const paypalOrderResponse = await fetch(paypalApiUrl("/v2/checkout/orders"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          custom_id: `${identity.profile.id}|${productId}`,
          description: String(book.title || "Shoppers Ocean eBook").slice(0, 127),
          amount: {
            currency_code: "USD",
            value: INTERNATIONAL_PRICE_USD,
          },
        }],
        application_context: {
          brand_name: "Shoppers Ocean",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
      cache: "no-store",
    });

    const paypalOrder = await paypalOrderResponse.json().catch(() => ({})) as Record<string, any>;
    if (!paypalOrderResponse.ok || !paypalOrder.id) {
      console.error("PayPal order creation failed:", paypalOrderResponse.status, paypalOrder?.name);
      return NextResponse.json(
        { error: "PayPal could not prepare checkout. Please try again." },
        { status: 502 }
      );
    }

    const now = new Date().toISOString();
    try {
      await db.prepare(
        "INSERT INTO orders (id, user_id, book_id, amount, currency, status, razorpay_order_id, paypal_order_id, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, 'INR', 'pending', NULL, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(),
        identity.profile.id,
        productId,
        priceInINR,
        String(paypalOrder.id),
        now,
        now
      ).run();
    } catch (dbError) {
      console.error("Unable to save pending PayPal order:", dbError);
      return NextResponse.json(
        { error: "We could not safely prepare your purchase. You have not been charged; please try again." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { orderId: String(paypalOrder.id), amount: INTERNATIONAL_PRICE_USD, currency: "USD" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: "Unable to start PayPal checkout. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
