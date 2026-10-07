import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Application Submitted" };

export default function SubmittedPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="max-w-2xl text-center bg-white rounded-xl shadow-md p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Thank you !</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Your application to register yourself as an author has been submitted and will be reviewed. We shall get back to you shortly.
          </p>
          <Link href="/" className="inline-block mt-8">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
