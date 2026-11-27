import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeActivityZones from "@/components/HomeActivityZones";
import { getCurrentUser } from "@/utils/auth/session";
export const metadata = { title: "Learning Academy | Shoppers Ocean", description: "Explore the learning activities and English practice sections at Shoppers Ocean.", alternates: { canonical: "https://shoppersocean.com/learning-academy" } };
export default async function LearningAcademyPage() { const user = await getCurrentUser(); return <><Header user={user} /><HomeActivityZones userId={user?.id ?? null} initialSection="learning" standalone /><Footer /></>; }
