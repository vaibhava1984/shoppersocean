import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const { productId, productIds } = await req.json();

        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        if (productId) {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, order_date, status')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('status', 'completed');

            if (error) throw error;
            return NextResponse.json({
                hasPurchased: Boolean(orders?.length),
                orderDetails: orders?.map(order => ({ order_id: order.id, purchase_date: order.order_date, status: order.status }))
            });
        }

        if (productIds) {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, product_id, order_date, status')
                .eq('user_id', userId)
                .in('product_id', productIds)
                .eq('status', 'completed');

            if (error) throw error;
            const result: Record<string, any> = {};
            productIds.forEach((id: string) => { result[id] = { hasPurchased: false, orderDetails: [] }; });
            orders?.forEach(order => {
                if (order.product_id in result) {
                    result[order.product_id].hasPurchased = true;
                    result[order.product_id].orderDetails.push({ order_id: order.id, purchase_date: order.order_date, status: order.status });
                }
            });
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400 });
    } catch (error) {
        console.error('Error checking purchase:', error);
        return NextResponse.json({ error: 'Error checking purchase' }, { status: 500 });
    }
}
