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
                                At Shoppers Ocean, we open the doors to a captivating world of beautifully designed flipbooks, where stories come alive and reading becomes an extraordinary experience. With engaging features and an inviting reading experience, we bring knowledge, imagination, and entertainment together on one exclusive platform, serving readers in multiple Indian and international languages and bringing fascinating stories and ideas closer to audiences across the globe.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                Our journey began on November 10<sup>th</sup>, 2024, with a vision to make reading more enjoyable and to create meaningful opportunities for authors. Today, we aspire to build a global destination where readers can discover fascinating stories and explore a world of ideas, inspiration, and entertainment.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                We believe that great experiences go beyond exceptional content. That is why we strive to offer our readers an enjoyable and convenient journey, while ensuring that every purchase and product delivery is as smooth and hassle-free as possible. Your satisfaction inspires us to keep raising our standards.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                At Shoppers Ocean, we are equally passionate about empowering both emerging and established authors. Our platform offers writers an opportunity to transform their literary creations into beautifully designed flipbooks, reach a worldwide audience, gain recognition for their work, and earn monetary rewards. We want every author to have the opportunity to share their imagination with the world and turn their passion for writing into a rewarding journey.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                Integrity, quality, and responsiveness are at the heart of everything we do. We are committed to maintaining the highest standards and promise to address your queries, concerns, and suggestions with promptness, sincerity, and thoughtful attention. Your trust matters to us, and your feedback helps us grow.
                            </p>

                            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-700 mb-6">
                                We envision Shoppers Ocean as more than a reading platform: a place where entertainment meets opportunity, readers discover their next favourite story, authors find their audience, and customers enjoy a seamless shopping experience. We are deeply grateful for your support and look forward to accompanying you on this exciting journey of stories, discovery, and endless possibilities. 😊
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