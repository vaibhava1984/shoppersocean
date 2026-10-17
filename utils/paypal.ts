import type { D1Database } from "@cloudflare/workers-types";

const PAYPAL_API_BASE = "https://api-m.paypal.com";

export async function ensurePaypalSchema(db: any) {
  const statements = [
    "ALTER TABLE orders ADD COLUMN paypal_order_id TEXT",
    "ALTER TABLE payments ADD COLUMN paypal_order_id TEXT",
    "ALTER TABLE payments ADD COLUMN paypal_capture_id TEXT",
    "ALTER TABLE payments ADD COLUMN original_amount REAL",
    "ALTER TABLE payments ADD COLUMN original_currency TEXT",
    "ALTER TABLE payments ADD COLUMN payment_method TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id) WHERE paypal_order_id IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id) WHERE paypal_order_id IS NOT NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paypal_capture_id ON payments(paypal_capture_id) WHERE paypal_capture_id IS NOT NULL",
  ];

  for (const statement of statements) {
    try {
      await db.prepare(statement).run();
    } catch (error) {
      const message = String(error).toLowerCase();
      if (
        message.includes("duplicate column") ||
        message.includes("already exists")
      ) {
        continue;
      }
      throw error;
    }
  }
}

export function getPaypalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal Live credentials are not configured");
  }
  return { clientId, clientSecret };
}

export async function getPaypalAccessToken() {
  const { clientId, clientSecret } = getPaypalCredentials();
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json() as { access_token?: string };
  if (!response.ok || !data.access_token) {
    console.error("PayPal OAuth token request failed:", response.status);
    throw new Error("PayPal authentication failed");
  }
  return data.access_token;
}

export function paypalApiUrl(path: string) {
  return `${PAYPAL_API_BASE}${path}`;
}
