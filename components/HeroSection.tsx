import React from 'react';
import Link from 'next/link';
import AdminNotificationBell from '@/components/AdminNotificationBell';

interface HeroSectionProps {
 title?: string; subtitle?: string; buttonText?: string; buttonLink?: string;
 imageSrc?: string; imageAlt?: string; welcomeName?: string; isAdmin?: boolean; isAuthor?: boolean;
}
const HeroSection: React.FC<HeroSectionProps> = ({title="Shoppers Ocean",subtitle="One Destination. Endless Ways to Enjoy.",imageSrc="/homepage_hero.jpeg",imageAlt="Featured Book",welcomeName,isAdmin=false,isAuthor=false}) => (
 <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-14 md:py-16 overflow-visible">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8"><div className="relative flex flex-col md:flex-row items-center justify-between">
   {welcomeName?.trim() && <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-center"><p className="welcome-greeting text-2xl md:text-3xl font-semibold text-white">Welcome {welcomeName.trim().split(/\s+/)[0]} 😊</p></div>}
   {(isAdmin || isAuthor) && <div className="absolute left-[43%] top-[-3.5rem] z-20 flex -translate-x-1/2 items-center gap-3">
    {isAdmin && <><AdminNotificationBell /><Link href="/admin_panel" className="relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center">Admin Panel</Link></>}
    {!isAdmin && isAuthor && <Link href="/author-panel" className="relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center">Author Panel</Link>}
   </div>}
   <div className="md:w-1/2 mb-8 md:mb-0 flex flex-col items-center text-center"><style>{`@keyframes oceanTitleZoom { 0% { opacity: 0; transform: scale(.72); filter: blur(5px); } 65% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } } @keyframes oceanTaglineZoom { 0% { opacity: 0; transform: scale(.78); filter: blur(4px); } 65% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }`}</style>{welcomeName?.trim() && <div className="mb-5 min-h-[2.5rem]" aria-hidden="true" />}<h1 className="ocean-title w-full text-center text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight animate-[oceanTitleZoom_7s_cubic-bezier(.16,1,.3,1)_both]">{title}</h1><p className="max-w-xl text-xl md:text-2xl mb-6 font-extrabold tracking-wide leading-relaxed animate-[oceanTaglineZoom_7s_cubic-bezier(.16,1,.3,1)_both] [text-shadow:0_2px_14px_rgba(0,0,0,0.28)] motion-reduce:animate-none"><span className="text-amber-200">{subtitle.startsWith("One Destination.") ? "One Destination." : subtitle}</span>{subtitle.startsWith("One Destination.") && <> <span className="text-white">Endless Ways</span> <span className="text-pink-200">to Enjoy.</span></>}</p></div>
   <div className="md:w-1/2"><div className="relative mx-auto w-full max-w-md">{imageSrc && <img src={imageSrc} alt={imageAlt} width={640} height={420} fetchPriority="high" className="block w-full aspect-[4/3] object-cover rounded-[1.75rem] shadow-2xl animate-[heroZoom_5s_ease-out_both]" /> }</div><div className="mt-6 flex justify-center md:justify-start"><Link href="/subscribe-now" className="rounded-full border border-white/70 bg-white px-8 py-3.5 text-base font-black tracking-wide text-blue-800 shadow-xl transition hover:scale-105 hover:bg-cyan-50 animate-[heroZoom_5s_ease-out_both]">Subscribe Now</Link></div></div>
  </div></div>
 </section>
);
export default HeroSection;
