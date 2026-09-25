import Header from "@/components/Header";
import Footer from "@/components/Footer"
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";
import { redirect } from "next/navigation"
import MySales from './mySales';

export const metadata = {
    title: 'My Sales',
    description: 'My Sales',
}

export default async function MySalesPage() {
    const user: any = await getFirebaseUser();
    if (!user) redirect("/");
    let isAuthor = Boolean(user.isAuthor);
    if (!isAuthor) {
        const profile = await firestore.collection("profiles").doc(user.uid).get();
        isAuthor = profile.exists && Boolean(profile.data()?.isAuthor);
    }
    if (!isAuthor) redirect("/");

    const snap = await firestore.collection("authors").where("user_id", "==", user.uid).limit(1).get();
    const currentAuthorDetails: any = snap.empty ? null : { author_id: snap.docs[0].id, ...snap.docs[0].data() };
    if (!currentAuthorDetails?.author_id) redirect("/");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-10 bg-white">
                <MySales authorId={currentAuthorDetails.author_id} />
            </section>
            <Footer />
        </div>
    )
}
