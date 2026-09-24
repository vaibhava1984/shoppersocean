"use client";
import React, { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from "@/components/ui/toaster"


const AuthorOrdersDashboard = ({ authorId }: {
    authorId: string
}) => {
    const { toast } = useToast();
    const [timeFrame, setTimeFrame] = useState('month');
    const [orderedBooksData, setOrderedBooksData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    const getFilteredDate = (filterType) => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        switch (filterType) {
            case 'today':
                return startOfDay.toISOString();
            case 'week':
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                return startOfWeek.toISOString();
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return startOfMonth.toISOString();
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                return startOfYear.toISOString();
            case 'untilnow':
                return new Date(0).toISOString(); // Returns "1970-01-01T00:00:00.000Z"
            default:
                return null; // for all time
        }
    };

    const getSalesData = async (authorId, timeFilter = null) => {
        const response = await fetch(`/api/my-sales?authorId=${encodeURIComponent(authorId)}&timeFrame=${encodeURIComponent(timeFilter || '')}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load sales data');
        return data;
    };

    useEffect(() => {
        if (authorId) {
            setLoading(true);
            getSalesData(authorId, timeFrame).then(f => {
                // console.log("dingding===>", f)
                setOrderedBooksData(f)
                setLoading(false);
            }).catch(err => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: err?.message || "Failed to load data",
                });
            })
        }
    }, [authorId, timeFrame])

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <Toaster />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Sales</h1>
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="untilnow">Until Now</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (<div className="p-6 bg-gray-50">
                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                {/* Table Skeleton */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <Skeleton className="h-6 w-32" />
                    </div>

                    <div className="overflow-x-auto">
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>) : (
                <div className="p-6 bg-gray-50">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-900">{orderedBooksData.totalOrders}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                            <p className="text-3xl font-bold text-gray-900">₹{orderedBooksData.totalRevenue}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-gray-500 text-sm font-medium">Active Books</h3>
                            <p className="text-3xl font-bold text-gray-900">{orderedBooksData.totalActiveBooks}</p>
                        </div>
                    </div>

                    {/* Sales Details Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Sales Details</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (INR)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacted Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orderedBooksData.salesDetails?.map((sale) => (
                                        <tr key={sale.bookId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.bookTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{sale.amount_in_inr}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.transactedAmount} {sale.transactedAmountCurrency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(sale.saleDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AuthorOrdersDashboard;