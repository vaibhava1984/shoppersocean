'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function MobileMenu({ user }: {
    user: any
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                className="relative z-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </Button>

            {/* Mobile menu overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 pointer-events-auto"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile menu panel */}
            <div
                className={`fixed top-0 right-0 z-40 h-full w-64 bg-white transform transition-transform duration-200 ease-in-out pointer-events-none ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col p-4 space-y-4 mt-16">
                    <a href="/" className="text-slate-600 hover:text-blue-600 py-2">Home</a>
                    <a href="/bookShelf" className="text-slate-600 hover:text-blue-600 py-2">Bookshelf</a>
                    <a href="/about" className="text-slate-600 hover:text-blue-600 py-2">About</a>
                    <a href="/contact" className="text-slate-600 hover:text-blue-600 py-2">Contact us</a>

                    {!user && (
                        <div className="flex flex-col space-y-2 pt-4">
                            <Link href="/login?type=signup" className="inline-block px-2 py-2 rounded-md text-blue-600 border-blue-600 hover:bg-gray-200">Sign Up</Link>
                            <Link href="/login" className="inline-block px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}