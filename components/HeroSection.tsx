import React from 'react';
import Link from 'next/link';
import AdminNotificationBell from '@/components/AdminNotificationBell';

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    imageSrc?: string;
    imageAlt?: string;
    welcomeName?: string;
    isAdmin?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title = "Shoppers Ocean",
    subtitle = "One World. Many Languages. Amazing Flipbooks. Beautiful Stories.",
    imageSrc = "/homepage_hero.jpeg",
    imageAlt = "Featured Book",
    welcomeName,
    isAdmin = false,
}) => {
    return (
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-18 overflow-visible">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                    {welcomeName?.trim() && (
                        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-center">
                            <p className="welcome-greeting text-2xl md:text-3xl font-semibold text-white">
                                Welcome {welcomeName.trim().split(/\s+/)[0]} 😊
                            </p>
                        </div>
                    )}
                    {isAdmin && (
                        <div className="absolute left-0 top-3 z-30 flex items-center gap-2 sm:top-4 sm:gap-3">
                            <AdminNotificationBell />
                            <Link href="/admin_panel" className="relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center">
                                Admin Panel
                            </Link>
                        </div>
                    )}
                    <div className="md:w-1/2 mb-8 md:mb-0">
                        {welcomeName?.trim() && <div className="mb-5 min-h-[2.5rem]" aria-hidden="true" />}
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight italic opacity-0 translate-y-4 animate-[fadeInUp_0.6s_ease-out_forwards]">{title}</h1>
                        <p className="text-xl md:text-2xl mb-10 text-white font-semibold opacity-0 scale-95 animate-[zoomIn_6s_ease-out_forwards] italic">{subtitle}</p>
                    </div>
                    <div className="md:w-1/2">
                        <div className="relative mx-auto w-full max-w-md">
                            <img src={imageSrc} alt={imageAlt} width={640} height={420} fetchPriority="high" className="block w-full rounded-lg shadow-2xl opacity-0 scale-95 animate-[fadeInUp_0.6s_ease-out_forwards]" />
                            <div className="pointer-events-none absolute right-0 top-3 z-20 flex items-start gap-1 sm:right-2 sm:top-4" aria-label="Choose your language">
                                <div role="note" className="relative rounded-xl border-2 border-black bg-white px-1.5 py-1 text-center text-black shadow-md">
                                    <p className="text-[9px] font-extrabold leading-[1.05] sm:text-[10px]">choose<br />your<br />Language</p>
                                    <span aria-hidden="true" className="absolute -left-1 top-4 h-2 w-2 rotate-45 border-b-2 border-l-2 border-black bg-white" />
                                </div>
                                <svg aria-hidden="true" viewBox="0 0 70 112" className="h-[58px] w-[36px] shrink-0 sm:h-[68px] sm:w-[42px]" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="36" cy="107" rx="15" ry="3" fill="#164E63" opacity=".25"/>
                                    <path d="M28 66 L25 91 L22 103 L31 103 L36 81 L42 103 L51 103 L46 88 L45 66" fill="#F7C8A5" stroke="#263238" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M25 100 L33 100 L34 106 L20 106 Z M42 100 L50 100 L56 106 L41 106 Z" fill="#FF6B6B" stroke="#263238" strokeWidth="1.5"/>
                                    <path d="M25 45 Q36 40 47 45 L49 69 Q36 76 23 68 Z" fill="#F472B6" stroke="#263238" strokeWidth="1.5"/>
                                    <path d="M27 48 L18 59 L11 50 M45 48 L39 34 L27 25" fill="none" stroke="#F7C8A5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M27 48 L18 59 L11 50 M45 48 L39 34 L27 25" fill="none" stroke="#263238" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="35" cy="23" r="15" fill="#F7C8A5" stroke="#263238" strokeWidth="1.5"/>
                                    <path d="M20 24 Q16 5 35 6 Q53 5 51 24 L46 18 Q36 22 25 16 Z" fill="#5B352B" stroke="#263238" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <circle cx="30" cy="24" r="1.5" fill="#263238"/><circle cx="40" cy="24" r="1.5" fill="#263238"/>
                                    <path d="M31 30 Q35 33 39 30" fill="none" stroke="#A83E49" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};

export default HeroSection;
