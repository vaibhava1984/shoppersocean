import React from 'react';

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
    return (
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-18 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
