import React from 'react';
import Link from 'next/link';

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    imageSrc?: string;
    imageAlt?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title = "Shoppers Ocean",
    subtitle = "Where every wave brings a new deal",
    imageSrc = "/homepage_hero.jpeg",
    imageAlt = "Featured Book",
}) => {
    const navigation = [
        ["/", "Home"],
        ["/bookShelf", "Bookshelf"],
        ["/about", "About"],
        ["/contact", "Have a question"],
    ];

    return (
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-18 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <nav aria-label="Main navigation" className="mb-12">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                        {navigation.map(([href, label]) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/30 text-white font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-white/20 hover:border-white/50 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <h1
                            className="text-4xl md:text-6xl font-bold mb-6 leading-tight italic opacity-0 translate-y-4 animate-[fadeInUp_3s_ease-out_forwards]"
                        >
                            {title}
                        </h1>
                        <p
                            className="text-xl md:text-2xl mb-10 opacity-0 translate-y-4 animate-[fadeInUp_3s_ease-out_forwards] italic"
                        >
                            {subtitle}
                        </p>
                    </div>

                    <div className="md:w-1/2 relative">
                        <img
                            src={imageSrc}
                            alt={imageAlt}
                            className="w-full max-w-md mx-auto rounded-lg shadow-2xl opacity-0 scale-95 animate-[fadeInUp_3s_ease-out_forwards]"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
};

export default HeroSection;
