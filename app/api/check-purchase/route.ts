import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { productId, productIds } = await req.json();

    if (!user?.id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const ids = productId ? [productId] : Array.isArray(productIds) ? productIds : [];
    if (!ids.length) return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400 });

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, product_id, order_date, status, payments!payments_order_id_fkey(status)')
      .eq('user_id', user.id)
      .in('product_id', ids);

    if (error) throw error;

    const isCompleted = (order: any) => {
      if (String(order?.status || '').toLowerCase() === 'completed') return true;
      const payments = order?.payments;
      if (Array.isArray(payments)) return payments.some((p: any) => String(p?.status || '').toLowerCase() === 'completed');
      return String(payments?.status || '').toLowerCase() === 'completed';
    };

    if (productId) {
      const matching = (orders || []).filter((order: any) => String(order.product_id) === String(productId) && isCompleted(order));
      return NextResponse.json({
        hasPurchased: matching.length > 0,
        orderDetails: matching.map((order: any) => ({ order_id: order.id, purchase_date: order.order_date, status: order.status }))
      });
    }

    const result: Record<string, any> = {};
    ids.forEach((id: string) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
    (orders || []).forEach((order: any) => {
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
