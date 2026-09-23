import type { CloudflareEnv } from "../auth/types"

export async function hasPurchasedBook(
  env: CloudflareEnv,
  userId: string,
  bookId: string,
): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT 1 FROM orders
     WHERE user_id = ? AND product_id = ?
       AND LOWER(COALESCE(status, '')) IN ('completed', 'captured', 'paid', 'authorized')
     ORDER BY order_date DESC LIMIT 1`,
  ).bind(userId, bookId).first()
  return Boolean(row)
}
