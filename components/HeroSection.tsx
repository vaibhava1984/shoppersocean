import React from 'react';
import Link from 'next/link'; // If using Next.js, otherwise use standard 'react-router-dom' for routing in React

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
    buttonText,
    buttonLink
}) => {
    return (
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-18">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    {/* Left Column */}
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight italic">
                            <span className="block transform hover:scale-105 transition-transform duration-300">
                                {title}
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 opacity-90 italic">{subtitle}</p>
                        {buttonLink && (
                            <a href={buttonLink} className="inline-block bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                                {buttonText}
                            </a>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="md:w-1/2 relative">
                        <img
                            src={imageSrc}
                            alt={imageAlt}
                            className="w-full max-w-md mx-auto rounded-lg shadow-2xl transform hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
