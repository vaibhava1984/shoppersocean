import Header from "@/components/Header";
import { currentUser } from "@clerk/nextjs/server";
import Footer from "@/components/Footer";
import Settings from "./Settings";
export const metadata={title:"My Settings",description:"My Settings"};
export default async function SettingsPage(){
 const user=await currentUser();
 const initialUser=user?{email:user.emailAddresses?.[0]?.emailAddress??"",phone:user.phoneNumbers?.find(p=>p.verification?.status==="verified")?.phoneNumber??"",user_metadata:{full_name:user.firstName??"",country:(user.publicMetadata?.country as string)||"",address:(user.publicMetadata?.address as string)||""}}:null;
 return <div className="min-h-screen bg-slate-50 text-slate-900"><Header/><section className="py-10 bg-white"><Settings initialUser={initialUser}/></section><Footer/></div>;
}