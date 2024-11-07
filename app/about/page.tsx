import Header from "@/components/Header";
import Footer from "@/components/Footer"

export const metadata = {
    title: 'About',
    description: 'Discover Our Story and Mission',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        About shoppersocean
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 italic">Discover Our Story and Mission</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">


                        <div className="prose prose-lg max-w-none">
                            <p className="lead text-xl text-slate-600 mb-8">
                                At shoppersocean, we invite you to dive into a world of amazing books where every reader, regardless of taste or preference, can discover something extraordinary. Our expansive collection spans all genres, offering endless opportunities for entertainment, learning and inspiration.
                            </p>

                            <p className="text-xl text-slate-600 mb-6">
                                Founded on ________, we embarked on this journey with a commitment to providing our global audience with high-quality content. Our diverse selection of books ensures that every reader can immerse themselves in a sea of knowledge and enjoyment.
                            </p>

                            <p className="text-xl text-slate-600 mb-6">
                                We prioritise not only the excellence of our content but also a smooth and hassle-free buying experience. Our goal is to make your reading journey as delightful as possible from selection to purchase.
                            </p>

                            <p className="text-xl text-slate-600 mb-6">
                                In addition to serving our readers, shoppersocean is proud to support both established and emerging authors. We offer a platform where their works can reach a vast and eager audience, ensuring that their creative efforts receive the recognition and financial reward they deserve.
                            </p>

                            <p className="text-xl text-slate-600 mb-6">
                                Integrity, quality, and responsiveness are at the core of everything we do. We are dedicated to maintaining the highest standards and we promise to address any queries, concerns, or suggestions with prompt and thoughtful attention.
                            </p>

                            <p className="text-xl text-slate-600 mb-6">
                                We believe that this endeavour to bring knowledge and entertainment to your doorstep will be embraced by readers and writers alike. We are grateful for your support and look forward to accompanying you on this exciting literary journey.
                            </p>

                            <div className="mt-12 text-right flex flex-col items-end">
                                <p className="text-xl font-semibold">With gratitude,</p>
                                <p className="text-xl font-bold text-blue-600 mt-2">Vaibhav Ahuja</p>
                                <p className="text-xl text-slate-600">Founder</p>
                                <div className="w-[100px] h-[100px] rounded-full overflow-hidden mt-2">
                                    <img src="/founder.jpeg" alt="shoppersocean Team" className="object-contain bg-gray-50 object-top" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div >
    )
}