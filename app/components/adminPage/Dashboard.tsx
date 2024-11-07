"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Dashboard = () => {
    const [booksCount, setBooksCount] = useState(0)
    const [authorsCount, setAuthorsCount] = useState(0)
    const [profilesCount, setProfilesCount] = useState(0)

    useEffect(() => {
        getDashboardData()
    }, [])

    const getDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard_counts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            // console.log("dashboard data=>", data)
            if (data) {
                setAuthorsCount(data.authorsCount)
                setBooksCount(data.booksCount)
                setProfilesCount(data.profilesCount)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{booksCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{authorsCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profilesCount}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
