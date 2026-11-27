import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeActivityZones from "@/components/HomeActivityZones";
import { getCurrentUser } from "@/utils/auth/session";
export const metadata = { title: "Learning Academy | Shoppers Ocean", description: "Explore the learning activities and English practice sections at Shoppers Ocean.", alternates: { canonical: "https://shoppersocean.com/learning-academy" } , openGraph: { type: "website", images: [{ url: "/api/share-preview/learning", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/api/share-preview/learning"] } };
export default async function LearningAcademyPage() { const user = await getCurrentUser(); return <><Header user={user} /><HomeActivityZones userId={user?.id ?? null} initialSection="learning" standalone /><Footer /></>; }
