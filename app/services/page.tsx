import Header from "@/components/Header";
import Footer from "@/components/Footer"
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

export const metadata = {
    title: 'Services',
    description: 'A shopping and entertainment center.',
}

export default function ServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1
                        className="text-4xl md:text-6xl font-bold mb-6 leading-tight opacity-0 translate-y-4 animate-[fadeInUp_3s_ease-out_forwards]"
                    >
                        Our Services
                    </h1>
                    <p
                        className="text-xl md:text-2xl mb-8 translate-y-4 opacity-0 animate-[fadeInUp_3s_ease-out_forwards] italic"
                    >
                        A shopping and entertainment center
                    </p>
                </div>
            </section>
            <div>
                <AuthorApplicationBanner />
            </div>

            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Commitment</h2>
                            <p className="mb-6">
                                At Shoppers Ocean we are committed to providing a diverse range of High quality e-books based on variety of categories for our readers. In addition to providing for our readers, we give established and up-and-coming writers an easy and amazing platform so they can reach millions of readers worldwide and showcase their creativity and works. We guarantee our esteemed writers that they will receive a substantial monetary compensation contingent on the volume of sales they attain. Alongside we also ensure the honest and fruitful deals to our valuable customers. Our goal is to create a thriving ecosystem where Shopping is a fun and creativity knows no bounds.
                            </p>

                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Future Plans</h2>
                            <p className="mb-6">
                                We are expanding quickly so that we can provide our esteemed writers and readers with even more. we plan to continue this entertaining trip of reading and writing into more languages.
                            </p>
                            <p className="mb-6">
                                In addition to this, we are going to add various commodities/products to serve our valueable customers across the nation in the best way possible, so that not only they get great deals with the best offers but they also get a smooth and seamless experience from buying to receiving.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}