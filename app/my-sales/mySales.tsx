"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const AuthorOrdersDashboard = ({ authorId }: {
    authorId: string
}) => {
    const [timeFrame, setTimeFrame] = useState('month');
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrderData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .rpc('get_author_orders_analytics', {
                    p_author_id: authorId,
                    p_time_frame: timeFrame
                });

            if (error) {
                console.error('Error fetching order data:', error);
                return;
            }

            // Process data for visualization
            const processedData = data.reduce((acc, curr) => {
                const existingPeriod = acc.find(item => item.timePeriod === curr.time_period);
                if (existingPeriod) {
                    existingPeriod[curr.book_title] = curr.order_count;
                    existingPeriod.totalOrders += curr.order_count;
                    existingPeriod.totalAmount += Number(curr.total_amount);
                } else {
                    acc.push({
                        timePeriod: curr.time_period,
                        [curr.book_title]: curr.order_count,
                        totalOrders: curr.order_count,
                        totalAmount: Number(curr.total_amount)
                    });
                }
                return acc;
            }, []);

            setOrderData(processedData);
            setLoading(false);
        };

        fetchOrderData();
    }, [authorId, timeFrame, supabase]);

    const uniqueBooks = [...new Set(orderData.flatMap(period =>
        Object.keys(period).filter(key =>
            !['timePeriod', 'totalOrders', 'totalAmount'].includes(key)
        )
    ))];

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Orders Dashboard</h1>
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {orderData.reduce((sum, period) => sum + period.totalOrders, 0)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        ₹{orderData.reduce((sum, period) => sum + period.totalAmount, 0).toLocaleString()}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Books</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold">
                        {uniqueBooks.length}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orders Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orderData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timePeriod" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {uniqueBooks.map((book, index) => (
                                    <Line
                                        key={book}
                                        type="monotone"
                                        dataKey={book}
                                        stroke={`hsl(${index * (360 / uniqueBooks.length)}, 70%, 50%)`}
                                        strokeWidth={2}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthorOrdersDashboard;