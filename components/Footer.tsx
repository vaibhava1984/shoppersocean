import { BookOpen, Menu, Star, ChevronRight } from 'lucide-react'

export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <BookOpen className="h-8 w-8 text-blue-300" />
                            <span className="text-2xl font-bold text-blue-300">Shoppers Ocean</span>
                        </div>
                        <div className="flex space-x-4">
                            <a href="/services" className="hover:text-blue-300">Services</a>
                            <a href="/terms-and-conditions" className="hover:text-blue-300">Terms and conditions</a>
                            <a href="/contact" className="hover:text-blue-300">Contact Us</a>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-blue-200">
                        <p>&copy; 2024 Shoppers Ocean. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}