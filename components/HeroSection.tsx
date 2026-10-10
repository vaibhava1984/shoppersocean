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
                    <div className="md:w-1/2">
                        <div className="relative mx-auto w-full max-w-md">
                            <div
                                role="note"
                                aria-label="A message for visitors"
                                className="absolute right-[3%] top-[17%] z-10 w-[34%] rounded-[48%] border-[3px] border-black bg-white px-1 py-1.5 text-center text-black shadow-[0_0_10px_rgba(0,0,0,0.35)] opacity-0 scale-90 animate-[earthquakeZoom_3.5s_ease-out_forwards] sm:w-[34%] sm:px-2 sm:py-1.5"
                            >
                                <p className="text-[11px] sm:text-xs font-extrabold leading-snug [text-shadow:0_0_1px_rgba(0,0,0,0.85)]">
                                    Heyy! 🙋<br />
                                    Where are you from?<br />
                                    We&apos;ve got something<br />
                                    special for you, too! ❤️
                                </p>
                                <span aria-hidden="true" className="absolute -left-2 top-[48%] h-3 w-3 rotate-45 border-l-[3px] border-b-[3px] border-black bg-white" />
                            </div>
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                width={640}
                                height={420}
                                fetchPriority="high"
                                className="block w-full rounded-lg shadow-2xl opacity-0 scale-95 animate-[fadeInUp_0.6s_ease-out_forwards]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};

export default HeroSection;
