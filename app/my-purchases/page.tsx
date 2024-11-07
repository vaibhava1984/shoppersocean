import Header from "@/components/Header";
import Footer from "@/components/Footer"
import MyPurchases from './myPurchases';

export const metadata = {
    title: 'My Orders',
    description: 'My Orders',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-20 bg-white">
                <MyPurchases />
            </section>
            <Footer />
        </div>
    )
}