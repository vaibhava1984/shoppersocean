import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';

const COMPLETED_STATUSES = new Set(['completed', 'paid', 'success', 'successful', 'captured']);

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { productId, productIds } = await req.json();
    const ids = productId ? [String(productId)] : Array.isArray(productIds) ? productIds.map(String) : [];
    if (!ids.length) return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400 });

    const admin = createAdminClient();
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('id, product_id, order_date, status, razorpay_order_id')
      .eq('user_id', user.id)
      .in('product_id', ids);
    if (ordersError) throw ordersError;

    const orderRows = orders || [];
    const lookupIds = Array.from(new Set(
      orderRows.flatMap((order: any) => [order.id, order.razorpay_order_id]).filter(Boolean).map(String)
    ));
    let payments: any[] = [];
    if (lookupIds.length) {
      const { data, error: paymentsError } = await admin
        .from('payments')
        .select('order_id, status')
        .in('order_id', lookupIds);
      if (paymentsError) throw paymentsError;
      payments = data || [];
    }

    const isCompleted = (order: any) => {
      if (COMPLETED_STATUSES.has(String(order?.status || '').toLowerCase())) return true;
      const validIds = new Set([String(order?.id || ''), String(order?.razorpay_order_id || '')].filter(Boolean));
      return payments.some((payment: any) =>
        validIds.has(String(payment?.order_id || '')) &&
        COMPLETED_STATUSES.has(String(payment?.status || '').toLowerCase())
      );
    };

    if (productId) {
      const matching = orderRows.filter((order: any) => String(order.product_id) === String(productId) && isCompleted(order));
      return NextResponse.json({
        hasPurchased: matching.length > 0,
        orderDetails: matching.map((order: any) => ({ order_id: order.id, purchase_date: order.order_date, status: order.status })),
      });
    }

    const result: Record<string, any> = {};
    ids.forEach((id: string) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
    orderRows.forEach((order: any) => {
      const id = String(order.product_id);
      if (id in result && isCompleted(order)) {
        result[id].hasPurchased = true;
        result[id].orderDetails.push({ order_id: order.id, purchase_date: order.order_date, status: order.status });
      }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json({ error: 'Error checking purchase' }, { status: 500 });
  }
}
