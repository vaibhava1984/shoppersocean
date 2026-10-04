import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireUser } from "@/utils/auth/requireUser";
import { convertCurrency, fetchExchangeRates } from "@/utils/currency";

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { env } = getCloudflareContext();
    const keyId = String((env as any).RAZORPAY_KEY_ID ?? "").trim();
    const keySecret = String((env as any).RAZORPAY_KEY_SECRET ?? "").trim();
    if (!keyId || !keySecret) throw new Error("Razorpay server credentials are not configured");

    const body = await req.json();
    const currency = String(body?.currency || "INR").toUpperCase();
    const notesInput = body?.notes && typeof body.notes === "object" ? body.notes : {};
    const userId = identity.profile.id;
    const productId = typeof body?.product_id === "string" ? body.product_id : "";

    if (!/^[A-Z]{3}$/.test(currency) || !userId || !productId) {
      return NextResponse.json({ error: "Required payment information is missing or invalid" }, { status: 400 });
    }

    // D1 is the authority for the book price. Never trust a browser-supplied amount.
    const db = require("@/utils/cloudflare/d1").getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");
    const book = await db.prepare(
      "SELECT id, price FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(productId).first<Record<string, any>>();
    const baseAmount = Number(book?.price);
    if (!book || !Number.isFinite(baseAmount) || baseAmount <= 0) {
      return NextResponse.json({ error: "Book price is unavailable" }, { status: 400 });
    }

    let amount = baseAmount;
    if (currency !== "INR") {
      const rates = await fetchExchangeRates();
      amount = convertCurrency(baseAmount, "INR", currency, rates);
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Unable to determine the payment amount" }, { status: 400 });
    }

    const amountInSubunits = Math.round(amount * 100);
    if (amountInSubunits < 100) return NextResponse.json({ error: "Payment amount is below Razorpay's minimum order amount" }, { status: 400 });

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: basicAuth(keyId, keySecret), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountInSubunits,
        currency,
        notes: { ...notesInput, user_id: userId, product_id: productId, original_currency: currency, original_amount: amount, base_amount_inr: baseAmount, base_currency: "INR" }
      })
    });

    const razorpayData = await razorpayResponse.json();
    if (!razorpayResponse.ok || !razorpayData?.id) {
      console.error("Razorpay order creation failed:", { status: razorpayResponse.status, error: razorpayData?.error });
      return NextResponse.json({ error: razorpayData?.error?.description || "Unable to create payment order. Please try again." }, { status: razorpayResponse.status || 502 });
    }

    return NextResponse.json({ orderId: razorpayData.id, amount, currency }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Unable to create payment order. Please try again." }, { status: 500 });
  }
}
