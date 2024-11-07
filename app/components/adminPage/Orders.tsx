import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from "@/components/ui/button";

const Orders = () => {
    const orders = [
        { id: '001', customer: 'John Doe', status: 'New', total: '$99.99' },
        { id: '002', customer: 'Jane Smith', status: 'Packed', total: '$149.99' },
        { id: '003', customer: 'Bob Johnson', status: 'Dispatched', total: '$79.99' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Orders</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.total}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="mr-2">
                                    {order.status === 'New' ? 'Pack' : 'Dispatch'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Orders;
