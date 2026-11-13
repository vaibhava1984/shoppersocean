import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthorApplicationBanner from "@/app/components/AuthorApplicationBanner";

export const metadata = {
    title: "About Shoppers Ocean | Reading, Learning, Gaming & Entertainment",
    description: "Discover Shoppers Ocean, a global digital platform for interactive multilingual flipbooks, online games, quizzes, educational activities and entertainment.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />

            {/* Hero Section */}
            <section className="overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 py-20 text-white md:py-32">
                <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="mb-6 translate-y-4 text-4xl font-bold leading-tight opacity-0 animate-[fadeInUp_3s_ease-out_forwards] md:text-6xl">
                        About Shoppers Ocean
                    </h1>
                    <p className="mb-8 translate-y-4 text-xl font-semibold leading-relaxed opacity-0 animate-[fadeInUp_3s_ease-out_forwards] md:text-2xl">
                        Shoppers Ocean – Your World of Reading, Learning, Gaming &amp; Entertainment!
                    </p>
                </div>
            </section>

            <AuthorApplicationBanner />

            {/* About Content */}
            <section className="bg-white py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl font-sans">
                        <p className="mb-10 text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                            Shoppers Ocean is a global digital platform designed to bring together the joy of reading, the excitement of gaming, the value of learning and the pleasure of entertainment under one roof. Our vision is to create an engaging digital space where people from different parts of the world can explore, learn, play and entertain themselves.
                        </p>

                        <div className="mb-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm md:p-8">
                            <h2 className="mb-5 text-2xl font-bold leading-tight text-blue-800 md:text-3xl">
                                1. Flipbooks – A New Dimension of Digital Reading
                            </h2>
                            <p className="mb-5 text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                Discover an exciting world of digital reading through our interactive flipbooks. Explore books across multiple genres and languages, featuring realistic page-turning effects and page-turning sounds that bring the traditional reading experience to life in a digital format.
                            </p>
                            <p className="text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                We also provide an opportunity for emerging authors to showcase their creativity and share their literary work with readers across the globe.
                            </p>
                        </div>

                        <div className="mb-10 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 shadow-sm md:p-8">
                            <h2 className="mb-5 text-2xl font-bold leading-tight text-cyan-800 md:text-3xl">
                                2. Entertainment – Explore, Play and Enjoy
                            </h2>
                            <p className="text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                Step into our entertainment world, where fun, learning and interactive experiences come together. Explore a variety of engaging zones featuring online games, quizzes, educational activities, brain teasers and much more.
                            </p>
                            <p className="mt-5 text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                Whether you enjoy testing your knowledge, challenging your mind or simply playing for fun, there is something to make every visit interesting and enjoyable.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:p-8">
                            <h2 className="mb-5 text-2xl font-bold leading-tight text-blue-800 md:text-3xl">
                                Our Vision
                            </h2>
                            <p className="text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                At Shoppers Ocean, we believe that the digital world should offer more than just information and entertainment separately. It should create opportunities to read, discover, learn, interact and enjoy.
                            </p>
                            <p className="mt-5 text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                                We continuously strive to expand our platform with innovative digital experiences, bringing readers, learners, gaming enthusiasts and creative minds together.
                            </p>
                        </div>

                        <div className="mt-12 text-right">
                            <p className="mt-2 text-xl font-bold text-blue-700">Vaibhav Ahuja</p>
                            <p className="text-xl text-slate-600">Founder</p>
                            <div className="ml-auto mt-2 w-[100px]">
                                <img src="/founder.jpeg" alt="Shoppers Ocean Founder" className="bg-gray-50" />
                            </div>
                        </div>

                        <p className="mt-10 text-center text-xl font-bold text-blue-700 md:text-2xl">
                            Shoppers Ocean – Read More. Explore More. Enjoy More.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
