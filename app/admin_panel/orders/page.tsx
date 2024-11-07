import Header from "@/components/Header";
import Footer from "@/components/Footer"
import Orders from './orders';
import AdminSidebar from "../adminSidebar"

export const metadata = {
    title: 'Orders',
    description: 'Orders',
}

export default function OrdersPage() {
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Orders />
            </main>
        </div>
    )
}