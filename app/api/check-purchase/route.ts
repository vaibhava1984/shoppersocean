import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getUserByClerkId } from '@/cloudflare/db/users';
import { getUserOrders } from '@/cloudflare/db/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const clerkEnabled = () =>
    process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, productIds } = body;

        if (clerkEnabled()) {
            const { userId } = await auth();
            if (!userId) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
            }

            const { env } = getCloudflareContext();
            const d1User = await getUserByClerkId(env, userId);
            if (!d1User) {
                return NextResponse.json({ error: 'Account migration is not complete' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
            }

            const orders = await getUserOrders(env, d1User.id);
            const purchased = orders.filter((order) =>
                ['completed', 'captured', 'paid', 'authorized'].includes(String(order.status || '').toLowerCase())
            );

            if (productId) {
                const matching = purchased.filter((order) => order.product_id === productId);
                return NextResponse.json({
                    hasPurchased: matching.length > 0,
                    orderDetails: matching.map((order) => ({
                        order_id: order.id,
                        purchase_date: order.order_date,
                        status: order.status,
                    })),
                }, { headers: { 'Cache-Control': 'no-store' } });
            }

            if (Array.isArray(productIds)) {
                const result: Record<string, any> = {};
                productIds.forEach((id: string) => {
                    const matching = purchased.filter((order) => order.product_id === id);
                    result[id] = {
                        hasPurchased: matching.length > 0,
                        orderDetails: matching.map((order) => ({
                            order_id: order.id,
                            purchase_date: order.order_date,
                            status: order.status,
                        })),
                    };
                });
                return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
            }

            return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        const authorization = req.headers.get('authorization');
        const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
        let user = null;
        let supabase = await createClient();

        if (bearerToken) {
            supabase = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
            ) as typeof supabase;
            const { data, error } = await supabase.auth.getUser(bearerToken);
            if (!error) user = data.user;
        }

        if (!user) {
            const serverClient = await createClient();
            const { data } = await serverClient.auth.getUser();
            user = data.user;
            supabase = serverClient;
        }

        const userId = user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
        }

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
            }, { headers: { 'Cache-Control': 'no-store' } });
        }

        if (Array.isArray(productIds)) {
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
            return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
        }

        return NextResponse.json({ error: 'Product ID or Product IDs are required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Error checking purchase:', error);
        return NextResponse.json({ error: 'Error checking purchase' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}
