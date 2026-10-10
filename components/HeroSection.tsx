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
                            className="absolute right-0 top-0 z-10 w-[min(19rem,88%)] rounded-2xl bg-white px-4 py-3 text-center text-slate-800 shadow-xl opacity-0 scale-90 animate-[zoomIn_3.5s_ease-out_forwards] sm:right-2 sm:top-1 sm:px-5 sm:py-4"
                        >
                            <p className="text-base font-bold leading-snug sm:text-lg">Heyy! 🙋 Where are you from?</p>
                            <p className="mt-1 text-sm font-medium leading-snug sm:text-base">We&apos;ve got something special for you, too! <span aria-label="red heart" role="img">❤️</span></p>
                            <span aria-hidden="true" className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 rounded-[2px] bg-white" />
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
