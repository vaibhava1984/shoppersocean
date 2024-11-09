"use client";
import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) throw new Error('User not authenticated');

                // First fetch orders with product information
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        books (
                        id,
                        title,
                        price
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('order_date', { ascending: false });
                // console.log("ordersData-=====>", ordersData)

                if (ordersError) throw ordersError;

                // Then fetch corresponding payments
                const orderIds = ordersData.map(order => order.id);
                const { data: paymentsData, error: paymentsError } = await supabase
                    .from('payments')
                    .select('*')
                    .in('order_id', orderIds);

                if (paymentsError) throw paymentsError;

                // Combine orders, products, and payments
                const combinedData = ordersData.map(order => ({
                    ...order,
                    payment: paymentsData.find(payment => payment.order_id === order.id)
                }));
                // console.log("combinedData-=====>", combinedData)

                setPurchases(combinedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-red-600">Error loading purchases: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-[80%] mx-auto">
            <CardHeader>
                <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <AuthorApplicationBanner />
                </div>
                {purchases.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No purchases found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Book Title</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>
                                            {new Date(purchase.order_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/book/${purchase?.books?.id}`}>
                                                {purchase.books?.title || 'Unknown Book'}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {purchase.payment?.original_amount?.toFixed(2) || purchase.original_amount?.toFixed(2)} {purchase.payment.original_currency}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={getStatusColor(purchase.status)}
                                            >
                                                {purchase.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {purchase.payment?.payment_method || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PurchaseHistory;