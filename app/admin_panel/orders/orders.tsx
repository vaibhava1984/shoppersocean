"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const ITEMS_PER_PAGE = 100;

const AdminPurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFilter, setDateFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        successfulOrders: 0,
        pendingOrders: 0
    });

    const supabase = createClient();

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase
                .rpc('get_order_stats', {
                    p_date_filter: dateFilter,
                    p_status: statusFilter
                });

            if (error) throw error;
            // console.log("fetchStats data=>", data)
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchPurchases = async () => {
        try {
            setLoading(true);

            // First get total count for pagination
            let countQuery = supabase
                .from('orders')
                .select('id', { count: 'exact' });

            // Apply filters to count query
            if (statusFilter !== 'all') {
                countQuery = countQuery.eq('status', statusFilter);
            }

            // Apply date filter to count query
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

            switch (dateFilter) {
                case 'today':
                    countQuery = countQuery.gte('order_date', startOfDay);
                    break;
                case 'month':
                    countQuery = countQuery.gte('order_date', startOfMonth);
                    break;
                case 'year':
                    countQuery = countQuery.gte('order_date', startOfYear);
                    break;
            }

            const { count, error: countError } = await countQuery;
            if (countError) throw countError;
            setTotalCount(count || 0);

            // Fetch orders with pagination
            let query = supabase
                .from('orders')
                .select('*')
                .order('order_date', { ascending: false })
                .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

            // Apply same filters to main query
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            switch (dateFilter) {
                case 'today':
                    query = query.gte('order_date', startOfDay);
                    break;
                case 'month':
                    query = query.gte('order_date', startOfMonth);
                    break;
                case 'year':
                    query = query.gte('order_date', startOfYear);
                    break;
            }

            const { data: ordersData, error: ordersError } = await query;
            if (ordersError) throw ordersError;

            // Get unique product IDs
            const productIds = [...new Set(ordersData.map(order => order.product_id))];

            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('books')
                .select('id, title, price')
                .in('id', productIds);

            if (productsError) throw productsError;

            // Fetch payments
            const orderIds = ordersData.map(order => order.id);
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .in('order_id', orderIds);

            if (paymentsError) throw paymentsError;

            // Combine data
            const combinedData = ordersData.map(order => ({
                ...order,
                product: productsData.find(p => p.id === order.product_id),
                payment: paymentsData.find(p => p.order_id === order.id)
            }));

            // Apply search filter
            const filteredData = searchQuery
                ? combinedData.filter(order =>
                    order.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.razorpay_order_id?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                : combinedData;

            setPurchases(filteredData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchPurchases();
    }, [dateFilter, statusFilter, currentPage]);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(0);
    }, [dateFilter, statusFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPurchases();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Successful Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.successfulOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <div className="text-sm font-medium mb-2">Search</div>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by book title, email, or order ID..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium mb-2">Date Filter</div>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-sm font-medium mb-2">Status</div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                                fetchStats();
                                fetchPurchases();
                            }}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-red-600">Error loading purchases: {error}</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order Date</TableHead>
                                            <TableHead>Book Title</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Order ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchases.map((purchase) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell>
                                                    {format(new Date(purchase.order_date), 'MMM d, yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        <Link href={`/book/${purchase.product?.id}`}>{purchase.product?.title}</Link>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{purchase.product?.author}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{purchase.email}</div>
                                                    <div className="text-sm text-muted-foreground">{purchase.contact_number}</div>
                                                </TableCell>
                                                <TableCell>{purchase.payment?.original_amount} {purchase.payment?.original_currency}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                        }
                                                    >
                                                        {purchase.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{purchase.payment?.payment_method || 'N/A'}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {purchase.payment?.bank || purchase.payment?.card_network}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {purchase.razorpay_order_id}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} entries
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </Button>
                                    {/* Page numbers */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i;
                                            } else if (currentPage < 2) {
                                                pageNum = i;
                                            } else if (currentPage > totalPages - 4) {
                                                pageNum = totalPages - 5 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="w-10"
                                                >
                                                    {pageNum + 1}
                                                </Button>
                                            );
                                        })}
                                        {totalPages > 5 && currentPage < totalPages - 4 && (
                                            <>
                                                <span className="px-2 flex items-center">...</span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(totalPages - 1)}
                                                    className="w-10"
                                                >
                                                    {totalPages}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPurchaseHistory;