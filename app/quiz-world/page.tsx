import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeActivityZones from "@/components/HomeActivityZones";
import { getCurrentUser } from "@/utils/auth/session";
export const metadata = { title: "Quiz World | Shoppers Ocean", description: "Explore the General Knowledge Quiz, Riddle Corner and Mystery Quiz on Shoppers Ocean.", alternates: { canonical: "https://shoppersocean.com/quiz-world" } };
export default async function QuizWorldPage() { const user = await getCurrentUser(); return <><Header user={user} /><HomeActivityZones userId={user?.id ?? null} initialSection="games" standalone /><Footer /></>; }
