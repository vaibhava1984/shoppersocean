import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookIcon, Users, Globe, PenTool } from 'lucide-react'
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import Link from "next/link";

export const metadata = {
    title: 'Services',
    description: 'Empowering readers and writers worldwide.',
}

export default function ServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Our Services
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 italic">Empowering readers and writers worldwide</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg max-w-none">
                            <p className="lead text-xl text-slate-600 mb-12">
                                At shoppersocean, we are committed to providing a diverse range of services to both our readers and writers. Our goal is to create a thriving ecosystem where literature flourishes and creativity knows no bounds.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <BookIcon className="h-8 w-8 text-blue-600" />
                                            <h3 className="text-2xl font-bold text-slate-800">E-book Library</h3>
                                        </div>
                                        <p className="text-slate-600">
                                            We offer a vast collection of e-books across various categories, ensuring there's something for every reader's taste and interest.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <PenTool className="h-8 w-8 text-blue-600" />
                                            <h3 className="text-2xl font-bold text-slate-800">Author Platform</h3>
                                        </div>
                                        <p className="text-slate-600">
                                            We provide a platform for both established and emerging writers to showcase their creativity and reach millions of readers worldwide.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Commitment</h2>
                            <p className="mb-6">
                                For their everlasting amusement, education, and inspiration, we currently provide our readers with e-books based on a variety of categories. We will also be introducing books in paperback format soon in an effort to reach more of our esteemed readers.
                            </p>
                            <p className="mb-6">
                                In addition to providing for our users, we give established and up-and-coming writers a platform so they can reach millions of readers worldwide and showcase their creativity and works. We guarantee our esteemed writers that they will receive a substantial monetary compensation contingent on the volume of sales they attain.
                            </p>

                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Future Plans</h2>
                            <p className="mb-6">
                                We are expanding quickly so that we can provide our esteemed writers and readers with even more and we plan to continue this entertaining trip into more languages in the near future in order to better serve our esteemed writers and readers.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <Users className="h-8 w-8 text-blue-600" />
                                            <h3 className="text-2xl font-bold text-slate-800">Growing Community</h3>
                                        </div>
                                        <p className="text-slate-600">
                                            We're committed to fostering a vibrant community of readers and writers, creating opportunities for interaction and collaboration.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <Globe className="h-8 w-8 text-blue-600" />
                                            <h3 className="text-2xl font-bold text-slate-800">Global Expansion</h3>
                                        </div>
                                        <p className="text-slate-600">
                                            We're working on expanding our services to include more languages, reaching readers and writers across the globe.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-slate-800">Join Our Literary Journey</h2>
                    <p className="text-xl mb-8 text-slate-600">Whether you're a reader or a writer, there's a place for you in our growing community.</p>
                    <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg ">
                            <Link href="/bookShelf" >
                                Explore Books
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}