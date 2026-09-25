import Header from "@/components/Header";
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";
import Footer from "@/components/Footer";
import Settings from './Settings';

export const metadata={title:'My Settings',description:'My Settings'};
export default async function SettingsPage(){
 const user=await getFirebaseUser();
 const profileSnap = user ? await firestore.collection("profiles").doc(user.uid).get() : null;
 const profile:any = profileSnap?.exists ? profileSnap.data() : {};
 const settingsUser = user ? { ...user, email: user.email ?? profile.email ?? "", user_metadata: { full_name: profile.full_name ?? user.name ?? "", country: profile.country ?? "", address: profile.address ?? "" }, phone: profile.mobile ?? user.phone_number ?? "" } : null;
 return <div className="min-h-screen bg-slate-50 text-slate-900"><Header user={user}/><section className="py-10 bg-white"><Settings initialUser={settingsUser}/></section><Footer/></div>
}