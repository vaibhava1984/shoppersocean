"use client"
import { useState } from 'react'
import { BookOpen, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    return (
        <>
            <nav className="bg-white sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <a href="/" className="text-slate-600 hover:text-blue-600"><span className="text-2xl font-bold text-blue-600">Shoppers Ocean</span></a>
                        </div>
                        <div className="hidden md:flex space-x-4">
                            <a href="/" className="text-slate-600 hover:text-blue-600">Home</a>
                            <a href="/bookShelf" className="text-slate-600 hover:text-blue-600">Books</a>
                            <a href="/about" className="text-slate-600 hover:text-blue-600">About</a>
                            <a href="/contact" className="text-slate-600 hover:text-blue-600">Contact</a>
                        </div>
                        <div className="hidden md:flex space-x-2">
                            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">Sign Up</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign In</Button>
                        </div>
                        <Button variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu /></Button>
                    </div>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="md:hidden bg-white shadow-md">
                    <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
                        <a href="#" className="text-slate-600 hover:text-blue-600 py-2">Home</a>
                        <a href="#" className="text-slate-600 hover:text-blue-600 py-2">Books</a>
                        <a href="#" className="text-slate-600 hover:text-blue-600 py-2">About</a>
                        <a href="#" className="text-slate-600 hover:text-blue-600 py-2">Contact</a>
                        <div className="flex space-x-2 py-2">
                            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white w-full">Sign Up</Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full">Sign In</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}