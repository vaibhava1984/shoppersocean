/**
 * FIXED VERSION of app/my-sales/mySales.tsx â Supabase removed, D1 direct queries.
 *
 * This file shows the data-fetching logic using D1 via getCloudflareContext.
 * Replace the data-fetching portion of your existing mySales.tsx with this code.
 * The rendering/UI portion stays the same.
 */

// In a server component or server action:
import { getCurrentUser } from '@/lib/auth';

async function fetchSalesData(req: Request, bookIds: string[]) {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare');
  const { env } = await getCloudflareContext();
  const db = (env as any).DB as D1Database;
  const jwtSecret = (env as any).JWT_SECRET as string;

  // Step 1: Get current user
  const user = await getCurrentUser(req, db, jwtSecret);
  if (!user) throw new Error('Authentication required');

  // Step 2: Get orders for the author's books (D1 direct query)
  const placeholders = bookIds.map(() => '?').join(',');
  const ordersResult = await db.prepare(
    `SELECT id, book_id, created_at, status FROM orders WHERE book_id IN (${placeholders})`
  ).bind(...bookIds).all<{ id: string; book_id: string; created_at: string; status: string }>();

  const ordersData = ordersResult.results || [];

  // Step 3: Get payments for those orders (separate query â D1 doesn't support FK joins)
  const orderIds = ordersData.map(o => o.id);
  let paymentsData: any[] = [];
  if (orderIds.length > 0) {
    const payPlaceholders = orderIds.map(() => '?').join(',');
    const paymentsResult = await db.prepare(
      `SELECT order_id, amount_in_inr, original_amount, original_currency, updated_at FROM payments WHERE order_id IN (${payPlaceholders})`
    ).bind(...orderIds).all();
    paymentsData = paymentsResult.results || [];
  }

  return { ordersData, paymentsData };
}
