import Link from 'next/link'
import { BookOpen, Home, ShoppingCart, Users, PenTool } from 'lucide-react'

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white shadow-md">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-blue-600">Shoppers Ocean</h1>
                <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
            <nav className="mt-4">
                {[
                    { icon: Home, label: 'Dashboard', value: '' },
                    { icon: ShoppingCart, label: 'Orders', value: 'orders' },
                    { icon: Home, label: 'Home Section', value: 'home_section' },
                    { icon: BookOpen, label: 'Books', value: 'books' },
                    { icon: PenTool, label: 'Authors', value: 'authors' },
                    { icon: Users, label: 'Users', value: 'users' },
                    { icon: PenTool, label: 'Review Section', value: 'review_section' },
                    { icon: Home, label: 'Back to Homepage', value: '', homepageButton: true },
                ].map((item, index) => (
                    <Link
                        key={index}
                        className={`flex items-center w-full px-4 py-2 text-left rounded-md mx-2 my-1 ${
                            item.homepageButton
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'text-gray-700 hover:bg-blue-50'
                        }`}
                        href={item.homepageButton ? '/' : `/admin_panel/${item.value}`}
                    >
                        <item.icon className="w-5 h-5 mr-2" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}