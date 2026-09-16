import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { productId, productIds } = await req.json();

    if (!user?.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const ids = productId ? [String(productId)] : Array.isArray(productIds) ? productIds.map(String) : [];
    if (!ids.length) return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400 });

    // Use the authenticated user only for identity, then use the server admin
    // client for the ownership lookup. This avoids RLS/relation-query differences
    // causing a genuine completed purchase to appear as unpaid.
    const admin = createAdminClient();
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('id, product_id, order_date, status')
      .eq('user_id', user.id)
      .in('product_id', ids);

    if (ordersError) throw ordersError;

    const orderList = orders || [];
    const orderIds = orderList.map((order: any) => order.id).filter(Boolean);

    let payments: any[] = [];
    if (orderIds.length) {
      const { data, error: paymentsError } = await admin
        .from('payments')
        .select('order_id, status')
        .in('order_id', orderIds);
      if (paymentsError) throw paymentsError;
      payments = data || [];
    }

    const isCompleted = (order: any) => {
      if (String(order?.status || '').toLowerCase() === 'completed') return true;
      return payments.some((payment: any) =>
        String(payment?.order_id) === String(order?.id) &&
        String(payment?.status || '').toLowerCase() === 'completed'
      );
    };

    if (productId) {
      const matching = orderList.filter((order: any) =>
        String(order.product_id) === String(productId) && isCompleted(order)
      );
      return NextResponse.json({
        hasPurchased: matching.length > 0,
        orderDetails: matching.map((order: any) => ({
          order_id: order.id,
          purchase_date: order.order_date,
          status: order.status,
        })),
      }, { status: 200 });
    }

    const result: Record<string, any> = {};
    ids.forEach((id: string) => {
      result[id] = { hasPurchased: false, orderDetails: [] };
    });

    orderList.forEach((order: any) => {
      const id = String(order.product_id);
      if (id in result && isCompleted(order)) {
        result[id].hasPurchased = true;
        result[id].orderDetails.push({
          order_id: order.id,
          purchase_date: order.order_date,
          status: order.status,
        });
      }
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json({ error: 'Error checking purchase' }, { status: 500 });
  }
}
