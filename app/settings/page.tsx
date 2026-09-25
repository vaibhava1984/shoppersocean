import Header from "@/components/Header";
import { getFirebaseUser } from "@/lib/firebase/session";
import Footer from "@/components/Footer";
import Settings from './Settings';

export const metadata={title:'My Settings',description:'My Settings'};
export default async function SettingsPage(){
 const user=await getFirebaseUser();
 return <div className="min-h-screen bg-slate-50 text-slate-900"><Header user={user}/><section className="py-10 bg-white"><Settings initialUser={user}/></section><Footer/></div>
}