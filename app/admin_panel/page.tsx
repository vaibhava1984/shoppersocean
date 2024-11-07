"use client"
import React from 'react'
import Dashboard from '../components/adminPage/Dashboard';
import Orders from '../components/adminPage/Orders';
import AdminSidebar from "./adminSidebar"

export default function AdminDashboard() {

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Dashboard />
            </main>
        </div>
    )
}