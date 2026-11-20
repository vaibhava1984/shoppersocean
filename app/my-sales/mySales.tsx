import Link from "next/link";
import { getD1 } from "@/utils/cloudflare/d1";
import { ensureRevenueSchema } from "@/utils/revenue";
import { COUNTRIES } from "@/utils/countries";
import { fetchExchangeRates } from "@/utils/currency";
import { ensurePaypalSchema, getPaypalAccessToken, paypalApiUrl } from "@/utils/paypal";
import SalesSummary from "./SalesSummary";
import RevenueCalculator from "./RevenueCalculator";

type Props = { authorId: string | null; isAdmin: boolean; fromDate?: string; toDate?: string };

function saleTimestamp(sale: any) {
  const value = sale.payment_created_at || sale.updated_at || sale.created_at;
  const timestamp = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatPrice(amount: unknown, currency: unknown) {
  const value = Number(amount ?? 0);
  const code = String(currency || "").trim().toUpperCase();
  if (!Number.isFinite(value)) return "—";
  if (!code) return value.toFixed(2);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

export default async function MySales({ authorId, isAdmin, fromDate = "", toDate = "" }: Props) {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");
  await ensureRevenueSchema(db);
  await ensurePaypalSchema(db);

  const books = isAdmin
    ? ((await db.prepare("SELECT id,title,author_id FROM books WHERE COALESCE(is_deleted,0)=0 ORDER BY title ASC").all<{ id: string; title: string; author_id: string }>()).results || [])
    : authorId
      ? ((await db.prepare("SELECT id,title,author_id FROM books WHERE author_id=? AND COALESCE(is_deleted,0)=0 ORDER BY title ASC").bind(authorId).all<{ id: string; title: string; author_id: string }>()).results || [])
      : [];

  const ids = books.map((book) => book.id);

  // Reconcile PayPal orders against PayPal itself before reading dashboard totals.
  // Older successful checkouts may have an order row but no payments row when a
  // browser callback/webhook was missed; do not depend on payments existing first.
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const paypalOrders = (await db.prepare(
      "SELECT o.id,o.user_id,o.book_id,o.amount,o.currency,o.status,o.paypal_order_id,o.created_at,o.paypal_reconciliation_checked_at " +
      "FROM orders o WHERE o.book_id IN (" + placeholders + ") AND o.paypal_order_id IS NOT NULL " +
      "ORDER BY o.created_at DESC"
    ).bind(...ids).all<any>()).results || [];
    const checkCutoff = Date.now() - 6 * 60 * 60 * 1000;
    let reconciliationToken = "";
    for (const saved of paypalOrders) {
      const checkedAt = saved.paypal_reconciliation_checked_at ? new Date(saved.paypal_reconciliation_checked_at).getTime() : 0;
      const existing = await db.prepare(
        "SELECT id,paypal_capture_id,paypal_gross_amount_inr,gateway_fee_inr,paypal_payer_country FROM payments WHERE paypal_order_id=? LIMIT 1"
      ).bind(saved.paypal_order_id).first<any>();
      const needsRepair = String(saved.status).toLowerCase() === "completed" &&
        (!existing || !existing.paypal_capture_id || existing.paypal_gross_amount_inr == null || existing.gateway_fee_inr == null || !existing.paypal_payer_country);
      if (!needsRepair && checkedAt > checkCutoff) continue;

      try {
        if (!reconciliationToken) reconciliationToken = await getPaypalAccessToken();
        const orderResponse = await fetch(paypalApiUrl("/v2/checkout/orders/" + encodeURIComponent(String(saved.paypal_order_id))), {
          headers: { Authorization: "Bearer " + reconciliationToken }, cache: "no-store"
        });
        const paypalOrder = await orderResponse.json() as Record<string, any>;
        if (!orderResponse.ok || paypalOrder?.id !== saved.paypal_order_id) {
          throw new Error("PayPal order lookup failed (" + orderResponse.status + ")");
        }

        const unit = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units[0] : null;
        const expectedCustomId = String(saved.user_id) + "|" + String(saved.book_id);
        const paidCurrency = String(unit?.amount?.currency_code || "").toUpperCase();
        const paidAmount = Number(unit?.amount?.value);
        const expectedAmount = Number(saved.amount);
        const capture = unit?.payments?.captures?.find((item: any) => String(item?.status || "").toUpperCase() === "COMPLETED");
        if (String(paypalOrder.status || "").toUpperCase() === "COMPLETED" &&
            String(unit?.custom_id || "") === expectedCustomId &&
            paidCurrency === String(saved.currency || "").toUpperCase() &&
            Number.isFinite(paidAmount) && Math.abs(paidAmount - expectedAmount) <= 0.001 &&
            capture?.id && String(capture.status).toUpperCase() === "COMPLETED") {
          let captureDetails: Record<string, any> = capture;
          let breakdown = captureDetails?.seller_receivable_breakdown || {};
          if (!breakdown.paypal_fee || !breakdown.gross_amount) {
            const captureResponse = await fetch(paypalApiUrl("/v2/payments/captures/" + encodeURIComponent(String(capture.id))), {
              headers: { Authorization: "Bearer " + reconciliationToken }, cache: "no-store"
            });
            const fetchedCapture = await captureResponse.json() as Record<string, any>;
            if (captureResponse.ok && fetchedCapture?.id === capture.id) {
              captureDetails = fetchedCapture;
              breakdown = fetchedCapture.seller_receivable_breakdown || breakdown;
            }
          }

          const actualExchange = breakdown.exchange_rate || {};
          const sourceCurrency = String(actualExchange.source_currency || "").toUpperCase();
          const targetCurrency = String(actualExchange.target_currency || "").toUpperCase();
          const exchangeRate = Number(actualExchange.value);
          const grossAmount = Number(breakdown.gross_amount?.value ?? capture.amount?.value);
          const grossCurrency = String(breakdown.gross_amount?.currency_code || capture.amount?.currency_code || "").toUpperCase();
          const paypalFee = breakdown.paypal_fee || null;
          const feeAmount = paypalFee ? Number(paypalFee.value) : NaN;
          const feeCurrency = String(paypalFee?.currency_code || "").toUpperCase();
          const feeInReceivable = breakdown.paypal_fee_in_receivable_currency || null;
          const feeReceivableAmount = feeInReceivable ? Number(feeInReceivable.value) : NaN;
          const feeReceivableCurrency = String(feeInReceivable?.currency_code || "").toUpperCase();
          const receivable = breakdown.receivable_amount || breakdown.net_amount || null;
          const receivableAmount = receivable ? Number(receivable.value) : NaN;
          const receivableCurrency = String(receivable?.currency_code || "").toUpperCase();
          const captureTime = String(capture.create_time || captureDetails.create_time || paypalOrder.create_time || saved.created_at);
          const captureDate = captureTime.slice(0, 10);

          let effectiveUsdInrRate: number | null = null;
          if (sourceCurrency === "USD" && targetCurrency === "INR" && Number.isFinite(exchangeRate) && exchangeRate > 0) {
            effectiveUsdInrRate = exchangeRate;
          } else if (sourceCurrency === "INR" && targetCurrency === "USD" && Number.isFinite(exchangeRate) && exchangeRate > 0) {
            effectiveUsdInrRate = 1 / exchangeRate;
          }

          // If PayPal did not convert to INR, use the historical daily USD/INR
          // rate for the capture date, never today's rate.
          if (!effectiveUsdInrRate && /^\d{4}-\d{2}-\d{2}$/.test(captureDate)) {
            try {
              const historicalResponse = await fetch("https://api.frankfurter.dev/v1/" + captureDate + "?base=USD&symbols=INR", { cache: "no-store" });
              const historical = await historicalResponse.json() as Record<string, any>;
              const fallbackRate = Number(historical?.rates?.INR);
              if (historicalResponse.ok && Number.isFinite(fallbackRate) && fallbackRate > 0) effectiveUsdInrRate = fallbackRate;
            } catch {}
          }

          let grossInr: number | null = null;
          if (grossCurrency === "INR" && Number.isFinite(grossAmount)) grossInr = grossAmount;
          else if (grossCurrency === "USD" && effectiveUsdInrRate && Number.isFinite(grossAmount)) grossInr = grossAmount * effectiveUsdInrRate;

          let feeInr: number | null = null;
          if (feeReceivableCurrency === "INR" && Number.isFinite(feeReceivableAmount) && feeReceivableAmount >= 0) {
            feeInr = feeReceivableAmount;
          } else if (feeCurrency === "INR" && Number.isFinite(feeAmount) && feeAmount >= 0) {
            feeInr = feeAmount;
          } else if (feeCurrency === "USD" && effectiveUsdInrRate && Number.isFinite(feeAmount) && feeAmount >= 0) {
            feeInr = feeAmount * effectiveUsdInrRate;
          }
          if (grossInr == null && receivableCurrency === "INR" && Number.isFinite(receivableAmount) && feeInr != null) {
            grossInr = receivableAmount + feeInr;
          }

          let buyerCountry = String(
            paypalOrder?.payment_source?.paypal?.address?.country_code ||
            paypalOrder?.payer?.address?.country_code ||
            unit?.shipping?.address?.country_code || ""
          ).toUpperCase();

          // PayPal's transaction reporting record is the authoritative fallback
          // for historical payer country when the Orders response omits address.
          if (!/^[A-Z]{2}$/.test(buyerCountry) && capture?.id && /^\d{4}-\d{2}-\d{2}$/.test(captureDate)) {
            try {
              const start = new Date(captureDate + "T00:00:00Z");
              start.setUTCDate(start.getUTCDate() - 1);
              const end = new Date(captureDate + "T23:59:59Z");
              end.setUTCDate(end.getUTCDate() + 1);
              const nowForReport = new Date();
              if (end.getTime() > nowForReport.getTime()) end.setTime(nowForReport.getTime());
              const params = new URLSearchParams({
                transaction_id: String(capture.id),
                start_date: start.toISOString(),
                end_date: end.toISOString(),
                fields: "all",
                page_size: "100",
                page: "1"
              });
              const reportResponse = await fetch(paypalApiUrl("/v1/reporting/transactions?" + params.toString()), {
                headers: { Authorization: "Bearer " + reconciliationToken }, cache: "no-store"
              });
              const report = await reportResponse.json() as Record<string, any>;
              const detail = (report?.transaction_details || []).find((item: any) =>
                String(item?.transaction_info?.transaction_id || "") === String(capture.id)
              );
              buyerCountry = String(detail?.payer_info?.country_code || "").toUpperCase();
            } catch (reportError) {
              console.warn("PayPal historical country lookup was unavailable", saved.paypal_order_id, reportError);
            }
          }
          if (!/^[A-Z]{2}$/.test(buyerCountry)) buyerCountry = "";

          const nowIso = new Date().toISOString();
          const paymentId = existing?.id || crypto.randomUUID();
          if (existing) {
            await db.prepare(
              "UPDATE payments SET status='completed',paypal_capture_id=?,amount=?,currency=?,original_amount=?,original_currency=?,payment_method='PayPal',gateway_name='PayPal',paypal_gross_amount_inr=COALESCE(?,paypal_gross_amount_inr),gateway_fee_amount=?,gateway_fee_currency=?,gateway_fee_inr=COALESCE(?,gateway_fee_inr),paypal_receivable_amount=?,paypal_receivable_currency=?,paypal_exchange_rate=?,paypal_exchange_source_currency=?,paypal_exchange_target_currency=?,paypal_payer_country=COALESCE(NULLIF(?,''),paypal_payer_country),sale_country=COALESCE(NULLIF(sale_country,''),NULLIF(?,'')),created_at=COALESCE(?,created_at),updated_at=? WHERE id=?"
            ).bind(
              String(capture.id), paidAmount, paidCurrency, paidAmount, paidCurrency,
              grossInr, Number.isFinite(feeAmount) ? feeAmount : null, feeCurrency || null, feeInr,
              Number.isFinite(receivableAmount) ? receivableAmount : null, receivableCurrency || null,
              Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : null,
              sourceCurrency || null, targetCurrency || null, buyerCountry, buyerCountry,
              captureTime, nowIso, paymentId
            ).run();
          } else {
            await db.prepare(
              "INSERT INTO payments (id,order_id,user_id,book_id,amount,currency,status,razorpay_payment_id,razorpay_order_id,paypal_order_id,paypal_capture_id,original_amount,original_currency,payment_method,gateway_name,gateway_fee_amount,gateway_fee_currency,gateway_fee_inr,paypal_gross_amount_inr,paypal_receivable_amount,paypal_receivable_currency,paypal_exchange_rate,paypal_exchange_source_currency,paypal_exchange_target_currency,paypal_payer_country,sale_country,created_at,updated_at) " +
              "VALUES (?,?,?,?,?,?,'completed',NULL,NULL,?,?,?,?, 'PayPal','PayPal',?,?,?,?,?,?,?,?,?,?,?,?,?)"
            ).bind(
              paymentId, saved.id, saved.user_id, saved.book_id, paidAmount, paidCurrency,
              saved.paypal_order_id, String(capture.id), paidAmount, paidCurrency,
              Number.isFinite(feeAmount) ? feeAmount : null, feeCurrency || null, feeInr, grossInr,
              Number.isFinite(receivableAmount) ? receivableAmount : null, receivableCurrency || null,
              Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : null,
              sourceCurrency || null, targetCurrency || null, buyerCountry || null, buyerCountry || null,
              captureTime, nowIso
            ).run();
          }
          await db.prepare("UPDATE orders SET status='completed',paypal_reconciliation_checked_at=?,updated_at=? WHERE id=?")
            .bind(nowIso, nowIso, saved.id).run();
        } else {
          await db.prepare("UPDATE orders SET paypal_reconciliation_checked_at=? WHERE id=?")
            .bind(new Date().toISOString(), saved.id).run();
        }
      } catch (reconcileError) {
        console.error("PayPal sales reconciliation failed for order", saved.paypal_order_id, reconcileError);
        try {
          await db.prepare("UPDATE orders SET paypal_reconciliation_checked_at=? WHERE id=?")
            .bind(new Date().toISOString(), saved.id).run();
        } catch {}
      }
    }
  }

  let sales: any[] = [];

  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const sql =
      "SELECT o.id,o.book_id,o.created_at,o.status,b.title,p.id AS payment_id,p.amount,p.currency,p.created_at AS payment_created_at,p.updated_at,p.paypal_capture_id,p.paypal_order_id,p.paypal_gross_amount_inr,p.paypal_payer_country,p.sale_country,p.payment_method,p.gateway_name,u.registration_country " +
      "FROM orders o JOIN books b ON b.id=o.book_id " +
      "JOIN payments p ON p.order_id=o.id AND p.status='completed' " +
      "LEFT JOIN users u ON u.id=o.user_id " +
      "WHERE o.book_id IN (" + placeholders + ") AND o.status='completed' " +
      "ORDER BY COALESCE(p.created_at,p.updated_at,o.created_at) DESC";
    sales = (await db.prepare(sql).bind(...ids).all<any>()).results || [];
  }

  // Revenue is based on completed sales and confirmed gateway fees only.
  for (const statement of [
    "ALTER TABLE payments ADD COLUMN gateway_fee_amount REAL",
    "ALTER TABLE payments ADD COLUMN gateway_fee_currency TEXT",
  ]) {
    try { await db.prepare(statement).run(); }
    catch (error) {
      const message = String(error).toLowerCase();
      if (!message.includes("duplicate column") && !message.includes("already exists")) throw error;
    }
  }
  const revenueRows = ids.length ? ((await db.prepare(
    "SELECT p.id AS payment_id,p.amount,p.currency,p.gateway_fee_inr,p.gateway_fee_amount,p.gateway_fee_currency,p.gateway_fee_checked_at,p.razorpay_payment_id,p.paypal_capture_id,p.paypal_order_id,p.paypal_gross_amount_inr,p.paypal_receivable_amount,p.paypal_receivable_currency,p.paypal_exchange_rate,p.paypal_exchange_source_currency,p.paypal_exchange_target_currency,p.paypal_payer_country,p.sale_country,p.created_at,p.updated_at,o.created_at AS order_created_at,b.author_id AS book_author_id " +
    "FROM payments p JOIN orders o ON o.id=p.order_id JOIN books b ON b.id=p.book_id WHERE p.book_id IN (" + ids.map(() => "?").join(",") + ") AND p.status='completed' AND o.status='completed' ORDER BY COALESCE(p.updated_at,p.created_at,o.created_at) DESC"
  ).bind(...ids).all<any>()).results || []) : [];

  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const rates = await fetchExchangeRates();
  const toINR = (amount: number, currency: string): number | null => {
    const code = String(currency || "").toUpperCase();
    if (!Number.isFinite(amount) || amount < 0 || !code) return null;
    if (code === "INR") return amount;
    const rate = Number(rates[code]);
    if (!Number.isFinite(rate) || rate <= 0) return null;
    const converted = amount / rate;
    return Number.isFinite(converted) ? converted : null;
  };
  const staleBefore = Date.now() - 24 * 60 * 60 * 1000;
  let paypalToken = "";
  const salesByPaymentId = new Map<string, any>(sales.map((sale) => [String(sale.payment_id || ""), sale] as [string, any]));
  for (const row of revenueRows) {
    const checked = row.gateway_fee_checked_at ? new Date(row.gateway_fee_checked_at).getTime() : 0;
    try {
      if (row.paypal_capture_id) {
        const needsSettlement = row.paypal_gross_amount_inr == null || row.gateway_fee_inr == null;
        const needsCountry = !row.paypal_payer_country && !row.sale_country && Boolean(row.paypal_order_id);
        if (needsSettlement || needsCountry) {
          if (!paypalToken) paypalToken = await getPaypalAccessToken();
          if (needsSettlement) {
            const response = await fetch(paypalApiUrl("/v2/payments/captures/" + encodeURIComponent(String(row.paypal_capture_id))), {
              headers: { Authorization: "Bearer " + paypalToken }, cache: "no-store"
            });
            const capture = await response.json() as Record<string, any>;
            const breakdown = capture?.seller_receivable_breakdown || {};
            const fee = breakdown.paypal_fee || null;
            const feeInReceivable = breakdown.paypal_fee_in_receivable_currency || null;
            const exchange = breakdown.exchange_rate || {};
            const receivable = breakdown.receivable_amount || null;
            const paymentCurrency = String(row.currency || "").toUpperCase();
            const feeCurrency = String(fee?.currency_code || "").toUpperCase();
            const feeAmount = Number(fee?.value);
            const feeReceivableCurrency = String(feeInReceivable?.currency_code || "").toUpperCase();
            const feeReceivableAmount = Number(feeInReceivable?.value);
            const sourceCurrency = String(exchange?.source_currency || "").toUpperCase();
            const targetCurrency = String(exchange?.target_currency || "").toUpperCase();
            const exchangeRate = Number(exchange?.value);
            let grossInr: number | null = null;
            if (sourceCurrency === paymentCurrency && targetCurrency === "INR" && Number.isFinite(exchangeRate) && exchangeRate > 0) {
              grossInr = Number(row.amount) * exchangeRate;
            } else if (sourceCurrency === "INR" && targetCurrency === paymentCurrency && Number.isFinite(exchangeRate) && exchangeRate > 0) {
              grossInr = Number(row.amount) / exchangeRate;
            }
            let feeInr: number | null = null;
            if (feeReceivableCurrency === "INR" && Number.isFinite(feeReceivableAmount) && feeReceivableAmount >= 0) {
              feeInr = feeReceivableAmount;
            } else if (feeCurrency === "INR" && Number.isFinite(feeAmount) && feeAmount >= 0) {
              feeInr = feeAmount;
            } else if (feeCurrency === paymentCurrency && Number.isFinite(feeAmount) && feeAmount >= 0) {
              if (sourceCurrency === paymentCurrency && targetCurrency === "INR" && exchangeRate > 0) feeInr = feeAmount * exchangeRate;
              else if (paymentCurrency === "INR") feeInr = feeAmount;
            }
            const receivableCurrency = String(receivable?.currency_code || "").toUpperCase();
            const receivableAmount = Number(receivable?.value);
            if (grossInr == null && receivableCurrency === "INR" && Number.isFinite(receivableAmount) && feeInr != null) {
              grossInr = receivableAmount + feeInr;
            }
            if (response.ok && capture?.id === row.paypal_capture_id) {
              const checkedAt = new Date().toISOString();
              await db.prepare(
                "UPDATE payments SET gateway_fee_amount=?,gateway_fee_currency=?,gateway_fee_inr=COALESCE(?,gateway_fee_inr),gateway_name='PayPal',gateway_fee_checked_at=?,paypal_gross_amount_inr=COALESCE(?,paypal_gross_amount_inr),paypal_receivable_amount=?,paypal_receivable_currency=?,paypal_exchange_rate=?,paypal_exchange_source_currency=?,paypal_exchange_target_currency=? WHERE id=?"
              ).bind(
                fee && feeCurrency ? feeAmount : null,
                feeCurrency || null,
                feeInr,
                checkedAt,
                grossInr,
                receivable && Number.isFinite(receivableAmount) ? receivableAmount : null,
                receivableCurrency || null,
                Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : null,
                sourceCurrency || null,
                targetCurrency || null,
                row.payment_id
              ).run();
              if (grossInr != null) row.paypal_gross_amount_inr = grossInr;
              if (feeInr != null) row.gateway_fee_inr = feeInr;
              row.gateway_fee_checked_at = checkedAt;
            }
          }
          if (needsCountry && row.paypal_order_id) {
            const orderResponse = await fetch(paypalApiUrl("/v2/checkout/orders/" + encodeURIComponent(String(row.paypal_order_id))), {
              headers: { Authorization: "Bearer " + paypalToken }, cache: "no-store"
            });
            const order = await orderResponse.json() as Record<string, any>;
            const countryCode = String(order?.payer?.address?.country_code || "").toUpperCase();
            if (orderResponse.ok && order?.id === row.paypal_order_id && /^[A-Z]{2}$/.test(countryCode)) {
              await db.prepare("UPDATE payments SET paypal_payer_country=?,sale_country=COALESCE(NULLIF(sale_country,''),?) WHERE id=?").bind(countryCode,countryCode,row.payment_id).run();
              row.paypal_payer_country = countryCode;
            }
          }
        }
        const sale = salesByPaymentId.get(String(row.payment_id));
        if (sale) {
          sale.paypal_gross_amount_inr = row.paypal_gross_amount_inr;
          sale.paypal_payer_country = row.paypal_payer_country;
        }
      } else if (row.razorpay_payment_id && keyId && keySecret &&
                 (row.gateway_fee_inr == null || !Number.isFinite(Number(row.gateway_fee_inr))) &&
                 (!checked || checked <= staleBefore)) {
        const response = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(String(row.razorpay_payment_id)), {
          headers: { Authorization: "Basic " + btoa(keyId + ":" + keySecret) }, cache: "no-store"
        });
        const payment = await response.json() as Record<string, any>;
        if (response.ok && payment?.id === row.razorpay_payment_id &&
            String(payment.currency || "INR").toUpperCase() === "INR" &&
            payment.fee != null && Number.isFinite(Number(payment.fee)) &&
            Number.isFinite(Number(payment.tax || 0))) {
          const feeAmount = (Number(payment.fee) + Number(payment.tax || 0)) / 100;
          const checkedAt = new Date().toISOString();
          await db.prepare("UPDATE payments SET gateway_fee_amount=?,gateway_fee_currency='INR',gateway_fee_inr=?,gateway_name='Razorpay',gateway_fee_checked_at=? WHERE id=?")
            .bind(feeAmount,feeAmount,checkedAt,row.payment_id).run();
          row.gateway_fee_amount=feeAmount; row.gateway_fee_currency="INR"; row.gateway_fee_inr=feeAmount; row.gateway_fee_checked_at=checkedAt;
        }
      }
    } catch (error) {
      console.error("Could not reconcile payment settlement details",row.payment_id,error);
    }
  }

  const monthlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const yearlyMap = new Map<string, { revenue: number; complete: boolean }>();
  const getPeriods = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value || String(date.getUTCFullYear());
    const month = parts.find((part) => part.type === "month")?.value || String(date.getUTCMonth() + 1).padStart(2, "0");
    return { month: year + "-" + month, year };
  };
  for (const row of revenueRows) {
    const date = new Date(row.created_at || row.updated_at || row.order_created_at || "");
    if (!Number.isFinite(date.getTime())) continue;
    const period = getPeriods(date);
    const gross = row.paypal_capture_id
      ? (row.paypal_gross_amount_inr == null ? null : Number(row.paypal_gross_amount_inr))
      : toINR(Number(row.amount), String(row.currency || "INR"));
    const fee = row.gateway_fee_inr == null ? NaN : Number(row.gateway_fee_inr);
    const valid = gross != null && gross >= 0 && Number.isFinite(fee) && fee >= 0;
    const net = valid ? Math.max(0, gross - fee) : 0;
    const isOwnBook = Boolean(isAdmin && authorId && String(row.book_author_id || "") === authorId);
    const earned = net * (isAdmin ? (isOwnBook ? 1 : 0.25) : 0.75);
    for (const [map, key, amount] of [
      [monthlyMap, period.month, earned],
      [yearlyMap, period.year, earned],
    ] as const) {
      const total = map.get(key) || { revenue: 0, complete: true };
      if (valid) total.revenue += amount; else total.complete = false;
      map.set(key, total);
    }
  }
  // Show every month from January through the current month, even with no sales.
  const periodNow = new Date();
  const currentParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(periodNow);
  const currentYear = Number(currentParts.find((part) => part.type === "year")?.value || periodNow.getUTCFullYear());
  const currentMonth = Number(currentParts.find((part) => part.type === "month")?.value || periodNow.getUTCMonth() + 1);
  for (let month = 1; month <= currentMonth; month++) {
    const period = `${currentYear}-${String(month).padStart(2, "0")}`;
    if (!monthlyMap.has(period)) monthlyMap.set(period, { revenue: 0, complete: true });
  }
  // Always offer 2025 and the current year, plus any earlier years with recorded sales.
  for (let year = Math.min(2025, currentYear); year <= currentYear; year++) {
    const period = String(year);
    if (!yearlyMap.has(period)) yearlyMap.set(period, { revenue: 0, complete: true });
  }
  const monthlyRevenue = Array.from(monthlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));
  const yearlyRevenue = Array.from(yearlyMap, ([period, total]) => ({ period, revenue: total.complete ? Number(total.revenue.toFixed(2)) : null }));

  const now = new Date();
  const istParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const todayKey = `${istParts.find((part) => part.type === "year")?.value}-${istParts.find((part) => part.type === "month")?.value}-${istParts.find((part) => part.type === "day")?.value}`;
  const shiftDateKey = (key: string, offset: number) => {
    const [year, month, day] = key.split("-").map(Number);
    const shifted = new Date(Date.UTC(year, month - 1, day + offset));
    return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth()+1).padStart(2,"0")}-${String(shifted.getUTCDate()).padStart(2,"0")}`;
  };
  const yesterdayKey = shiftDateKey(todayKey, -1);
  const sevenDaysAgoKey = shiftDateKey(todayKey, -6);
  const currentMonthPrefix = todayKey.slice(0, 7);
  const dateKeyForSale = (sale: any) => {
    const ts = saleTimestamp(sale);
    if (!ts) return "";
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ts));
    return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
  };
  const saleAmountINR = (sale: any): number | null => {
    if (sale.paypal_capture_id) {
      const amount = Number(sale.paypal_gross_amount_inr);
      return sale.paypal_gross_amount_inr != null && Number.isFinite(amount) && amount >= 0 ? amount : null;
    }
    const amount = Number(sale.amount);
    return String(sale.currency || "").toUpperCase() === "INR" && Number.isFinite(amount) && amount >= 0 ? amount : null;
  };
  const summaryFor = (matches: any[]) => {
    const result = { total: 0, razorpay: 0, paypal: 0, count: 0, pendingConversion: 0 };
    for (const sale of matches) {
      result.count += 1;
      const amount = saleAmountINR(sale);
      if (amount == null) {
        result.pendingConversion += 1;
        continue;
      }
      result.total += amount;
      const method = String(sale.payment_method || sale.gateway_name || (sale.paypal_capture_id ? "PayPal" : "Razorpay")).toLowerCase();
      if (method.includes("paypal")) result.paypal += amount;
      else result.razorpay += amount;
    }
    result.total = Number(result.total.toFixed(2));
    result.razorpay = Number(result.razorpay.toFixed(2));
    result.paypal = Number(result.paypal.toFixed(2));
    return result;
  };
  const salesSummary = {
    today: summaryFor(sales.filter((sale) => dateKeyForSale(sale) === todayKey)),
    yesterday: summaryFor(sales.filter((sale) => dateKeyForSale(sale) === yesterdayKey)),
    last7Days: summaryFor(sales.filter((sale) => {
      const key = dateKeyForSale(sale);
      return key >= sevenDaysAgoKey && key <= todayKey;
    })),
    thisMonth: summaryFor(sales.filter((sale) => dateKeyForSale(sale).slice(0, 7) === currentMonthPrefix)),
  };

  const hasRange = Boolean(fromDate && toDate && fromDate <= toDate);
  const filteredSales = hasRange
    ? sales.filter((sale) => {
        const key = dateKeyForSale(sale);
        return key && key >= fromDate && key <= toDate;
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6">
      <SalesSummary {...salesSummary} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Filter Sales by Date</h2>
        <form method="get" action="/my-sales" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-sm font-medium text-slate-700">
            From date
            <input required type="date" name="fromDate" defaultValue={fromDate} max={toDate || undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            To date
            <input required type="date" name="toDate" defaultValue={toDate} min={fromDate || undefined} max={todayKey} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Show Sales</button>
        </form>
      </section>

      {hasRange ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-semibold text-slate-900">Sales Results</h2>
              <p className="text-xs text-slate-500">{fromDate} to {toDate} · {filteredSales.length} {filteredSales.length === 1 ? "sale" : "sales"}</p>
            </div>
            <Link href="/my-sales" className="text-sm font-medium text-blue-700 hover:underline">Clear filter</Link>
          </div>
          {filteredSales.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5">Book Name</th>
                    <th className="px-4 py-3 font-semibold">Sale Price</th>
                    <th className="px-4 py-3 font-semibold sm:px-5">Sale Date &amp; Time</th>
                    <th className="px-4 py-3 font-semibold sm:px-5">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-50/40">
                      <td className="px-4 py-3 font-medium text-slate-800 sm:px-5">
                        <Link className="text-blue-700 underline-offset-4 hover:underline" href={"/book/" + sale.book_id}>{sale.title}</Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{formatPrice(sale.amount, sale.currency)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">{new Date(sale.payment_created_at || sale.updated_at || sale.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Kolkata" })}</td>
                      <td className="px-4 py-3 text-slate-700 sm:px-5">{COUNTRIES.find((country) => country.code === String(sale.sale_country || sale.paypal_payer_country || sale.registration_country || "").toUpperCase())?.name || "Not available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No completed sales found for these dates.</p>
          )}
        </section>
      ) : (
        <p className="px-1 text-xs text-slate-500">Choose a from date and to date to view sales for that period.</p>
      )}
      <RevenueCalculator monthly={monthlyRevenue} yearly={yearlyRevenue} />
    </main>
  );
}
