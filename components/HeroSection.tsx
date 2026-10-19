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
                        <div className="absolute left-[43%] top-[-3.5rem] z-20 flex -translate-x-1/2 items-center gap-3">
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
                            <div className="pointer-events-none absolute right-0 top-[8%] z-10 flex items-start gap-1 sm:right-[1%] sm:top-[7%]" aria-label="Choose your language">
                                <div role="note" className="relative mt-1 rounded-2xl border-2 border-black bg-white px-2.5 py-2 text-center text-black shadow-[0_3px_8px_rgba(0,0,0,0.28)] animate-[earthquakeZoom_3.5s_ease-out_forwards]">
                                    <p className="text-[12px] font-extrabold not-italic leading-[1.15] sm:text-sm">choose<br />your<br />Language</p>
                                    <span aria-hidden="true" className="absolute -right-1 top-[42px] h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-black bg-white sm:top-[48px]" />
                                </div>
                                <svg aria-hidden="true" viewBox="0 0 100 180" className="h-[112px] w-[62px] shrink-0 sm:h-[140px] sm:w-[78px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="51" cy="172" rx="27" ry="5" fill="#164E63" opacity=".28"/>
                                    <path d="M37 104 L31 145 L27 165 L40 165 L48 128 L54 165 L68 165 L65 142 L64 105 Z" fill="#F7C8A5" stroke="#263238" strokeWidth="2"/>
                                    <path d="M26 161 Q32 157 42 162 L43 170 L24 170 Z" fill="#FF6B6B" stroke="#263238" strokeWidth="2"/>
                                    <path d="M53 161 Q62 157 69 162 L76 170 L55 170 Z" fill="#FF6B6B" stroke="#263238" strokeWidth="2"/>
                                    <path d="M31 69 Q22 73 25 91 L31 113 Q49 123 68 111 L68 81 Q67 69 57 67 Z" fill="#F59E0B" stroke="#263238" strokeWidth="2.5"/>
                                    <path d="M34 75 L20 91 L10 75" stroke="#F7C8A5" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M34 75 L20 91 L10 75" stroke="#263238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M60 75 L44 54 L27 32" stroke="#F7C8A5" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M60 75 L44 54 L27 32" stroke="#263238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M30 35 L27 25 L23 33 L15 29 L19 38 L13 44 L22 43 L27 50 L29 42 Z" fill="#F7C8A5" stroke="#263238" strokeWidth="1.7" strokeLinejoin="round"/>
                                    <path d="M30 32 Q25 8 49 8 Q73 8 70 35 L64 49 L35 48 Z" fill="#5B352B" stroke="#263238" strokeWidth="2.5"/>
                                    <path d="M33 28 Q33 12 49 12 Q66 12 66 30 L64 42 Q61 55 49 55 Q36 54 33 41 Z" fill="#F7C8A5" stroke="#263238" strokeWidth="2"/>
                                    <path d="M31 31 Q27 14 43 8 Q61 3 70 22 L67 31 L60 21 Q49 27 34 23 Z" fill="#5B352B" stroke="#263238" strokeWidth="2" strokeLinejoin="round"/>
                                    <circle cx="41" cy="34" r="2.2" fill="#263238"/>
                                    <circle cx="56" cy="34" r="2.2" fill="#263238"/>
                                    <path d="M43 43 Q49 48 55 42" stroke="#A83E49" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="36" cy="41" r="3" fill="#F28B82" opacity=".8"/>
                                    <circle cx="61" cy="41" r="3" fill="#F28B82" opacity=".8"/>
                                    <path d="M31 66 Q49 58 65 67 L70 81 L64 88 L34 87 L27 80 Z" fill="#F472B6" stroke="#263238" strokeWidth="2.5"/>
                                    <path d="M39 61 L49 70 L58 61" fill="#FFFFFF" stroke="#263238" strokeWidth="1.5" strokeLinejoin="round"/>
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
