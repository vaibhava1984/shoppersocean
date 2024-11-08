import Header from "@/components/Header";
import Footer from "@/components/Footer"
import MySales from './mySales';

export const metadata = {
    title: 'My Sales',
    description: 'My Sales',
}

export default function MySalesPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <section className="py-20 bg-white">
                <MySales authorId="a2ba6f31-d510-46a3-b387-72096334f192" />
            </section>
            <Footer />
        </div>
    )
}