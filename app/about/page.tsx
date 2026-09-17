import Header from "@/components/Header";
import Footer from "@/components/Footer"
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

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
            <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1
                        className="text-4xl md:text-6xl font-bold mb-6 leading-tight opacity-0 translate-y-4 animate-[fadeInUp_3s_ease-out_forwards]"
                    >
                        About Shoppers Ocean
                    </h1>
                    <p
                        className="text-xl md:text-2xl mb-8 translate-y-4 opacity-0 animate-[fadeInUp_3s_ease-out_forwards] italic"
                    >
                        Discover Our Story and Mission
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
                        <div className="max-w-none font-sans">
                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-8">
                                At Shoppers Ocean, we invite you to dive into a world of amazing e-books and other commodities where everyone, can discover something very interesting as an e-book reader and also, can have great deals as a buyer of other commodities.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                Founded on November 10<sup>th</sup>, 2024 we embarked on this journey with a commitment to providing our readers with high-quality and intersting e-book content and to our customers of other commodities a trusted product line.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                We prioritise not only the excellence of our content/ products but also a smooth and hassle-free buying experience. Our goal is to make your buying journey as delightful as possible from selection to purchase.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                In addition to serving our readers, Shoppers Ocean is proud to support both established and emerging authors. We offer a platform where their writing works can reach a vast and eager audience, ensuring that their creative efforts receive the recognition and financial reward they deserve.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                Integrity, quality, and responsiveness are at the core of everything we do. We are dedicated to maintaining the highest standards and we promise to address any queries, concerns, or suggestions with prompt and thoughtful attention.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                We believe that this endeavour to bring knowledge and entertainment for our readers and a hassle free product delivery at the doorsteps of our buyers will be a great experience for our readers and buyers. We are grateful for your support and look forward to accompanying you on this exciting journey about entertainment and shopping with us. 😊
                            </p>

                            <div className="mt-12 text-right flex flex-col items-end">
                                {/* <p className="text-xl font-semibold">With gratitude,</p> */}
                                <p className="text-xl font-bold text-blue-600 mt-2">Vaibhav Ahuja</p>
                                <p className="text-xl text-slate-600">Founder</p>
                                <div className="w-[100px] mt-2">
                                    <img src="/founder.jpeg" alt="Shoppers Ocean Team" className="bg-gray-50" />
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