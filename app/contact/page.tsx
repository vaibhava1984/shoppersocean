import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import ContactForm from '../components/ContactForm';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

export const metadata = {
    title: 'Contact',
    description: 'Discover Our Story and Mission',
}

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Get in Touch
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 italic">We'd love to hear from you</p>
                </div>
            </section>
            <div>
                <AuthorApplicationBanner />
            </div>

            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Contact Information */}
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-slate-800">Contact Information</h2>
                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <Mail className="h-6 w-6 text-blue-600" />
                                                <p className="text-slate-700">kochimonu@gmail.com</p>
                                            </div>
                                            <div className="flex items-start space-x-4">
                                                <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                                                <p className="text-slate-700">
                                                    Tharangini plaza,<br />
                                                    Alanthara, Venjaramoodu<br />
                                                    Trivandrum<br />
                                                    695607
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Form */}
                            <div>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}