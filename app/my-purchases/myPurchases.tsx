"use client";
import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const db = createClient();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const { data: { user } } = await db.auth.getUser();
                if (!user) throw new Error('User not authenticated');

                const { data: ordersData, error: ordersError } = await db
                    .from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                if (ordersError) throw ordersError;

                const orders = ordersData || [];
                const bookIds = [...new Set(orders.map((o: any) => o.book_id).filter(Boolean))];
                const orderIds = orders.map((o: any) => o.id);
                const { data: booksData, error: booksError } = bookIds.length
                    ? await db.from('books').select('id, title, price').in('id', bookIds)
                    : { data: [], error: null };
                if (booksError) throw booksError;
                const { data: paymentsData, error: paymentsError } = orderIds.length
                    ? await db.from('payments').select('*').in('order_id', orderIds)
                    : { data: [], error: null };
                if (paymentsError) throw paymentsError;

                setPurchases(orders.map((order: any) => ({
                    ...order,
                    books: (booksData || []).find((b: any) => b.id === order.book_id),
                    payment: (paymentsData || []).find((p: any) => p.order_id === order.id)
                })));
            } catch (err: any) {
                setError(err.message);
            } finally { setLoading(false); }
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
                                            {purchase.payment?.amount?.toFixed(2) || purchase.amount?.toFixed(2)} {purchase.payment?.currency || purchase.currency}}
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