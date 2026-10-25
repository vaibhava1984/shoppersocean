import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Create Your Flipbook",
  description: "Become a Shoppers Ocean author and create your digital flipbook.",
};

export default function CreateYourFlipbookPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Create Your Flipbook</h1>
          <p className="text-xl md:text-2xl italic">Turn your words into an engaging digital experience.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Welcome Future Authors</h2>
          <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
            <p>Have you always dreamed of writing the first book of your life and seeing your book gaining recognition for your writing?</p>
            <p>Shoppers Ocean welcomes aspiring and established authors who wish to showcase their work and explore new opportunities to earn both fame and monetary benefits.</p>
            <p>You can join our growing community of authors and submit your original book content to be presented in an attractive, reader-friendly digital flipbook format. We aim to give your work a professional appearance while making it convenient and engaging for readers to enjoy online.</p>
            <p>Whether you are an experienced writer or publishing your work for the first time, we invite you to take this exciting step with us. Share your creativity, connect with readers, build your author presence, and create an opportunity for your literary work to generate income.</p>
            <p>Your story deserves to be read. Let Shoppers Ocean help turn your words into an engaging digital experience.</p>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mt-14 mb-6">How We Do This</h2>
          <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
            <p>Becoming an author with Shoppers Ocean is simple. To get started, you need to register with us as an author by completing the author registration process.</p>
            <p>A one-time, lifetime registration fee of ₹250 for authors in India or US$5 for authors outside India is applicable. Once your registration is successfully completed, you will become a registered Shoppers Ocean author and gain the opportunity to showcase your work to readers worldwide.</p>
            <p>We are committed to providing authors with a platform to present their books professionally, reach a wider audience, and build a meaningful connection with readers across the globe.</p>
            <p>Ready to begin your journey with us?</p>
            <p>Please read our <Link href="/author-policies" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">Author Policies</Link> carefully before registering. Once you are familiar with the policies, take the next step and become a valued member of the Shoppers Ocean authors and readers community.</p>
          </div>
          <div className="mt-5">
            <Link href="/author-policies" className="inline-flex min-h-11 items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
              Register as Author
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
