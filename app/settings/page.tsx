import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Settings from "./Settings";
import { getCurrentUser } from "@/utils/auth/session";

export const metadata={title:"My Settings",description:"My Settings"};

export default async function SettingsPage(){
 const user=await getCurrentUser();
 const initialUser=user?{email:String(user.email??""),mobile:String(user.mobile??""),fullName:String(user.full_name??""),country:String(user.country??""),address:String(user.address??"")}:null;
 return <div className="min-h-screen bg-slate-50 text-slate-900"><Header/><section className="py-10 bg-white"><Settings initialUser={initialUser}/></section><Footer/></div>;
}
