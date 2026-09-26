import { NextResponse } from 'next/server';
import { createClient } from '@/utils/db/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productIds } = body;
    const client = createClient();

    const { data: userData, error: userError } = await client.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const userId = user.id;

    if (productId) {
      const { data: orders, error } = await client
        .from('orders')
        .select('id, order_date, status')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('status', 'completed');

      if (error) throw error;

      return NextResponse.json(
        {
          hasPurchased: Boolean(orders?.length),
          orderDetails: orders?.map((order: any) => ({
            order_id: order.id,
            purchase_date: order.order_date,
            status: order.status,
          })),
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (Array.isArray(productIds)) {
      const { data: orders, error } = await client
        .from('orders')
        .select('id, product_id, order_date, status')
        .eq('user_id', userId)
        .in('product_id', productIds)
        .eq('status', 'completed');

      if (error) throw error;

      const result: Record<string, { hasPurchased: boolean; orderDetails: any[] }> = {};
      productIds.forEach((id: string) => {
        result[id] = { hasPurchased: false, orderDetails: [] };
      });

      orders?.forEach((order: any) => {
        if (order.product_id in result) {
          result[order.product_id].hasPurchased = true;
          result[order.product_id].orderDetails.push({
            order_id: order.id,
            purchase_date: order.order_date,
            status: order.status,
          });
        }
      });

      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    return NextResponse.json(
      { error: 'Product ID or Product IDs are required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json(
      { error: 'Error checking purchase' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
