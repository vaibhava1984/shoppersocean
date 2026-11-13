import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthorApplicationBanner from "@/app/components/AuthorApplicationBanner";

export const metadata = {
    title: "Our Services | Flipbooks, Games, Quizzes & Learning | Shoppers Ocean",
    description: "Explore Shoppers Ocean services: interactive multilingual digital flipbooks, author publishing opportunities, online games, educational quizzes, learning activities and brain teasers.",
    alternates: { canonical: "https://shoppersocean.com/services" },
};

const flipbookServices = [
    {
        icon: "📖",
        title: "Interactive Digital Reading",
        description: "Experience the joy of reading through interactive online flipbooks, featuring realistic page-turning effects and page-turning sounds that bring books to life in a digital format.",
    },
    {
        icon: "🌍",
        title: "Multiple Languages & Genres",
        description: "Discover a diverse collection of digital books across multiple languages and genres, making reading accessible and enjoyable for readers around the world.",
    },
    {
        icon: "✍️",
        title: "Opportunities for Emerging Authors",
        description: "We provide aspiring and emerging authors with an opportunity to showcase their literary creations and reach readers globally, with opportunities for recognition and monetary rewards.",
    },
];

const entertainmentServices = [
    {
        icon: "🎮",
        title: "Online Games",
        description: "Enjoy a variety of interactive online games that bring fun, excitement and engaging challenges to your screen.",
    },
    {
        icon: "🧠",
        title: "Quizzes & Knowledge Challenges",
        description: "Put your knowledge to the test with interesting quizzes covering general knowledge, English and other educational subjects.",
    },
    {
        icon: "🎓",
        title: "Learning & Educational Activities",
        description: "Make learning enjoyable through interactive educational activities, language exercises and knowledge-building experiences.",
    },
    {
        icon: "💡",
        title: "Brain Teasers & Mind Challenges",
        description: "Give your mind a workout with entertaining puzzles, riddles and activities designed to encourage thinking and problem-solving.",
    },
];

type ServiceCardProps = { icon: string; title: string; description: string; accent?: "blue" | "cyan" };

function ServiceCard({ icon, title, description, accent = "blue" }: ServiceCardProps) {
    const accentClasses = accent === "cyan"
        ? "border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-800"
        : "border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-800";

    return (
        <article className={`h-full rounded-2xl border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8 ${accentClasses}`}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">
                {icon}
            </div>
            <h3 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
                {title}
            </h3>
            <p className="text-lg font-semibold leading-relaxed text-slate-700 md:text-xl">
                {description}
            </p>
        </article>
    );
}

export default function ServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />

            {/* Hero Section */}
            <section className="overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 py-20 text-white md:py-32">
                <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="mb-6 translate-y-4 text-4xl font-bold leading-tight opacity-0 animate-[fadeInUp_3s_ease-out_forwards] md:text-6xl">
                        Our Services
                    </h1>
                    <p className="mb-8 translate-y-4 text-xl font-semibold leading-relaxed opacity-0 animate-[fadeInUp_3s_ease-out_forwards] md:text-2xl">
                        Your World of Reading, Learning, Gaming &amp; Entertainment!
                    </p>
                </div>
            </section>

            <AuthorApplicationBanner />

            <main className="bg-white py-16 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-14 max-w-4xl text-center">
                        <p className="text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                            At Shoppers Ocean, we bring together digital reading, entertainment, gaming and learning experiences on one platform. Explore our services and discover new ways to read, play, learn and enjoy.
                        </p>
                    </div>

                    {/* Flipbooks */}
                    <section aria-labelledby="flipbooks-services" className="mb-16">
                        <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-7 text-center md:px-10">
                            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">Our First Vertical</p>
                            <h2 id="flipbooks-services" className="text-3xl font-bold text-blue-800 md:text-4xl">
                                Flipbooks – Discover a World of Digital Reading
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {flipbookServices.map((service) => (
                                <ServiceCard key={service.title} {...service} accent="blue" />
                            ))}
                        </div>
                    </section>

                    {/* Entertainment */}
                    <section aria-labelledby="entertainment-services">
                        <div className="mb-8 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-7 text-center md:px-10">
                            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-cyan-700">Our Second Vertical</p>
                            <h2 id="entertainment-services" className="text-3xl font-bold text-cyan-800 md:text-4xl">
                                Entertainment – A World of Fun, Games &amp; Learning
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {entertainmentServices.map((service) => (
                                <ServiceCard key={service.title} {...service} accent="cyan" />
                            ))}
                        </div>
                    </section>

                    <div className="mt-16 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-6 py-10 text-center shadow-sm md:px-10">
                        <h2 className="mb-5 text-2xl font-bold text-blue-800 md:text-3xl">
                            Explore More. Experience More.
                        </h2>
                        <p className="mx-auto max-w-4xl text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
                            Whether you love reading, enjoy gaming, want to expand your knowledge or simply seek entertainment, Shoppers Ocean brings something interesting for everyone.
                        </p>
                        <p className="mt-7 text-xl font-bold text-blue-700 md:text-2xl">
                            Shoppers Ocean – Read More. Explore More. Enjoy More.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
