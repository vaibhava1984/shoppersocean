import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensurePaypalSchema, getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";
import { sendSaleNotification } from "@/utils/email/sendSaleNotification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Set to false to allow a PayPal payer whose email differs from the account email.
const ENFORCE_PAYER_EMAIL_MATCH = true;

export async function POST(req: Request) {
  try {
    const identity = await requireUser();
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paypalOrderId = String(body?.orderID || body?.orderId || "").trim();
    const productId = String(body?.productId || "").trim();
    if (!paypalOrderId || !productId) {
      return NextResponse.json({ error: "PayPal order and book are required" }, { status: 400 });
    }

    const db = getD1();
    if (!db) {
      return NextResponse.json({ error: "Cloudflare D1 is not available" }, { status: 503 });
    }
    await ensurePaypalSchema(db);

    const savedOrder = await db.prepare(
      "SELECT id, user_id, book_id, amount, currency, status FROM orders " +
      "WHERE paypal_order_id = ? AND user_id = ? AND book_id = ? LIMIT 1"
    ).bind(paypalOrderId, identity.profile.id, productId).first<Record<string, any>>();

    if (!savedOrder) {
      return NextResponse.json({ error: "PayPal order does not match this account and book" }, { status: 403 });
    }

    const accessToken = await getPaypalAccessToken();

    // ---------------------------------------------------------------------
    // PRE-CAPTURE IDENTITY CHECK
    // Read the order (no money moves) and confirm the PayPal payer is the
    // same person as the logged-in account. Runs BEFORE capture so a
    // mismatched payer is never charged.
    // ---------------------------------------------------------------------
    if (ENFORCE_PAYER_EMAIL_MATCH) {
      const preflightResponse = await fetch(
        paypalApiUrl(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`),
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const preflightOrder: Record<string, any> = await preflightResponse.json().catch(() => ({}));

      if (!preflightResponse.ok) {
        return NextResponse.json(
          { error: "Could not verify the PayPal order. Please try again." },
          { status: 502 }
        );
      }

      // If the order is already captured, this is a retry/recovery path.
      // Do not block it - the money is already taken and access must be granted.
      if (String(preflightOrder?.status) !== "COMPLETED") {
        const payerEmail = String(preflightOrder?.payer?.email_address || "").trim().toLowerCase();
        const accountEmail = String(
          identity.profile.email || (identity.user as any)?.email || ""
        ).trim().toLowerCase();

        if (payerEmail && accountEmail && payerEmail !== accountEmail) {
          console.warn(
            `PayPal payer mismatch: account=${accountEmail} payer=${payerEmail} order=${paypalOrderId}`
          );
          return NextResponse.json(
            {
              error:
                "This PayPal account does not match your Shoppers Ocean account email. " +
                `Please log in with ${accountEmail}, or pay using the PayPal account registered to that email. ` +
                "No payment has been taken.",
              code: "PAYER_EMAIL_MISMATCH",
              accountEmail,
            },
            { status: 403, headers: { "Cache-Control": "no-store" } }
          );
        }

        if (!payerEmail) {
          // PayPal did not return a payer email. We cannot verify, so we allow
          // the purchase rather than block a legitimate customer.
          console.warn(`PayPal payer email unavailable for order ${paypalOrderId}; allowing capture.`);
        }
      }
    }

    const captureResponse = await fetch(paypalApiUrl(
      `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`
    ), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `so-capture-${paypalOrderId}`.slice(0, 38),
      },
      cache: "no-store",
    });

    let paypalOrder: Record<string, any> = await captureResponse.json().catch(() => ({}));
    if (!captureResponse.ok) {
      const verifyResponse = await fetch(paypalApiUrl(
        `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`
      ), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const verifiedOrder = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok || verifiedOrder?.status !== "COMPLETED") {
        console.error("PayPal capture failed:", captureResponse.status, paypalOrder?.name);
        return NextResponse.json(
          { error: "PayPal could not confirm the payment. Please try again or contact support." },
          { status: 502 }
        );
      }
      paypalOrder = verifiedOrder;
    }

    const purchaseUnit = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units[0] : null;
    const capture = purchaseUnit?.payments?.captures?.find((item: any) => String(item?.status) === "COMPLETED");
    const expectedCustomId = `${identity.profile.id}|${productId}`;
    const paidCurrency = String(capture?.amount?.currency_code || "").toUpperCase();
    const paidAmount = Number(capture?.amount?.value);
    const expectedAmount = Number(savedOrder.amount);

    if (
      paypalOrder.status !== "COMPLETED" ||
      String(purchaseUnit?.custom_id || "") !== expectedCustomId ||
      !capture?.id ||
      paidCurrency !== "USD" ||
      !Number.isFinite(paidAmount) ||
      Math.abs(paidAmount - expectedAmount) > 0.001 ||
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      String(savedOrder.currency || "").toUpperCase() !== "USD"
    ) {
      return NextResponse.json({ error: "PayPal payment details did not match the expected purchase" }, { status: 409 });
    }

    const book = await db.prepare(
      "SELECT id, title FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(productId).first<Record<string, any>>();
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const captureId = String(capture.id);
    const payerAddress = paypalOrder?.payer?.address || {};
    const shippingAddress = purchaseUnit?.shipping?.address || {};
    const requestCountry = String(req.headers.get("cf-ipcountry") || "").trim().toUpperCase();
    const payerCountryCode = String(requestCountry || payerAddress?.country_code || shippingAddress?.country_code || "").toUpperCase();
    const validPayerCountry = /^[A-Z]{2}$/.test(payerCountryCode) ? payerCountryCode : null;
    const saleRegion = String(req.headers.get("cf-region") || payerAddress?.admin_area_1 || shippingAddress?.admin_area_1 || "").trim().slice(0,120);
    const saleCity = String(req.headers.get("cf-ipcity") || payerAddress?.admin_area_2 || payerAddress?.city || shippingAddress?.admin_area_2 || shippingAddress?.city || "").trim().slice(0,120);
    const existingPayment = await db.prepare(
      "SELECT id, order_id, user_id, book_id FROM payments WHERE paypal_order_id = ? OR paypal_capture_id = ? LIMIT 1"
    ).bind(paypalOrderId, captureId).first<Record<string, any>>();

    if (existingPayment) {
      if (
        String(existingPayment.order_id) !== String(savedOrder.id) ||
        String(existingPayment.user_id) !== identity.profile.id ||
        String(existingPayment.book_id) !== productId
      ) {
        return NextResponse.json({ error: "A conflicting PayPal payment record exists" }, { status: 409 });
      }
      await db.prepare(
        "UPDATE payments SET status = 'completed', paypal_capture_id = ?, currency = 'USD', original_amount = ?, original_currency = 'USD', payment_method = 'PayPal', paypal_payer_country=COALESCE(?,paypal_payer_country), sale_country=COALESCE(NULLIF(sale_country,''),?), updated_at = ? WHERE id = ?"
      ).bind(captureId, paidAmount, validPayerCountry, validPayerCountry, now, existingPayment.id).run();
    } else {
      try {
        await db.prepare(
          "INSERT INTO payments " +
          "(id, order_id, user_id, book_id, amount, currency, status, razorpay_payment_id, razorpay_order_id, paypal_order_id, paypal_capture_id, original_amount, original_currency, payment_method, paypal_payer_country, sale_country, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, ?, 'USD', 'completed', NULL, NULL, ?, ?, ?, 'USD', 'PayPal', ?, ?, ?, ?)"
        ).bind(
          crypto.randomUUID(),
          savedOrder.id,
          identity.profile.id,
          productId,
          Number(savedOrder.amount),
          paypalOrderId,
          captureId,
          paidAmount,
          validPayerCountry,
          validPayerCountry,
          now,
          now
        ).run();
      } catch (insertError) {
        // A simultaneous duplicate callback can hit the unique PayPal index.
        const duplicate = await db.prepare(
          "SELECT id, order_id, user_id, book_id FROM payments WHERE paypal_order_id = ? OR paypal_capture_id = ? LIMIT 1"
        ).bind(paypalOrderId, captureId).first<Record<string, any>>();
        if (!duplicate || String(duplicate.order_id) !== String(savedOrder.id) ||
            String(duplicate.user_id) !== identity.profile.id || String(duplicate.book_id) !== productId) {
          throw insertError;
        }
      }
    }

    await db.prepare("UPDATE payments SET sale_country=COALESCE(?,sale_country),sale_region=COALESCE(?,sale_region),sale_city=COALESCE(?,sale_city) WHERE paypal_order_id=?")
      .bind(validPayerCountry,saleRegion || null,saleCity || null,paypalOrderId).run();

    await db.prepare(
      "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ? AND user_id = ?"
    ).bind(now, savedOrder.id, identity.profile.id).run();

    const customer = await db.prepare("SELECT full_name,email FROM users WHERE id=? LIMIT 1").bind(identity.profile.id).first<Record<string, any>>();
    try {
      await sendSaleNotification({
        paymentId: captureId,
        paymentMethod: "PayPal",
        customerEmail: String(customer?.email || identity.profile.email || ""),
        customerName: String(customer?.full_name || ""),
        saleCountry: validPayerCountry,
        saleRegion,
        saleCity,
        bookId: productId,
        bookTitle: String(book.title || ""),
      });
    } catch (emailError) {
      console.error("PayPal sale notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      status: "completed",
      message: "PayPal payment verified and purchase recorded",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error verifying PayPal payment:", error);
    return NextResponse.json(
      { error: "Error verifying PayPal payment" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
