import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeActivityZones from "@/components/HomeActivityZones";
import { getCurrentUser } from "@/utils/auth/session";
export const metadata = { title: "Classic Games | Shoppers Ocean", description: "Play classic games and challenges on Shoppers Ocean.", alternates: { canonical: "https://shoppersocean.com/classic-games" } };
export default async function ClassicGamesPage() { const user = await getCurrentUser(); return <><Header user={user} /><HomeActivityZones userId={user?.id ?? null} initialSection="classic-games" standalone /><Footer /></>; }
