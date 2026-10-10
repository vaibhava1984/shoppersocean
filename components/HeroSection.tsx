import React from 'react';

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    imageSrc?: string;
    imageAlt?: string;
    welcomeName?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title = "Shoppers Ocean",
    subtitle = "One World. Many Languages. Amazing Flipbooks. Beautiful Stories.",
    imageSrc = "/homepage_hero.jpeg",
    imageAlt = "Featured Book",
    welcomeName,
}) => {
    return (
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-18 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                    {welcomeName?.trim() && (
                        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-center">
                            <p className="welcome-greeting text-2xl md:text-3xl font-semibold text-white">
                                Welcome {welcomeName.trim().split(/\s+/)[0]} 😊
                            </p>
                        </div>
                    )}
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        {welcomeName?.trim() && (
                            <div className="mb-5 min-h-[2.5rem]" aria-hidden="true" />
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight italic opacity-0 translate-y-4 animate-[fadeInUp_0.6s_ease-out_forwards]">{title}</h1>
                        <p className="text-xl md:text-2xl mb-10 text-white font-semibold opacity-0 scale-95 animate-[zoomIn_6s_ease-out_forwards] italic">{subtitle}</p>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div
                            role="note"
                            aria-label="A message for visitors"
                            className="absolute left-1 top-1/2 z-10 w-[54%] -translate-y-1/2 rounded-[48%] border-[3px] border-black bg-white px-3 py-4 text-center text-black shadow-[0_0_10px_rgba(0,0,0,0.35)] opacity-0 scale-90 animate-[zoomIn_3.5s_ease-out_forwards] sm:left-2 sm:w-[52%] sm:px-4 sm:py-5"
                        >
                            <p className="text-sm font-extrabold leading-snug sm:text-base md:text-lg">
                                Heyy! 🙋<br />
                                Where are you from?<br />
                                We&apos;ve got something<br />
                                special for you, too! ❤️
                            </p>
                            <span aria-hidden="true" className="absolute -right-[9px] top-[48%] h-4 w-4 rotate-45 border-r-[3px] border-t-[3px] border-black bg-white" />
                        </div>
                        <img
                            src={imageSrc}
                            alt={imageAlt}
                            width={640}
                            height={420}
                            fetchPriority="high"
                            className="w-full max-w-md mx-auto rounded-lg shadow-2xl opacity-0 scale-95 animate-[fadeInUp_0.6s_ease-out_forwards]"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
};

export default HeroSection;
