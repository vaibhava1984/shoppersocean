import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create Your Flipbook",
  description: "Become a Shoppers Ocean author and create your digital flipbook.",
};

const policies = [
  {
    title: "1. One-Time Lifetime Registration",
    content: "The author registration fee is a one-time, lifetime registration fee with Shoppers Ocean. No recurring author registration fee will be applicable.",
  },
  {
    title: "2. Individual Author Registration",
    content: "Author registration is strictly limited to one individual user and does not include groups, organizations, or additional persons under the same registration. You may update or modify your personal details whenever required, subject to the applicable procedures.",
  },
  {
    title: "3. Account Deletion",
    content: "If you delete your Shoppers Ocean account, whether intentionally or accidentally, your author registration will become null and void. Any unpaid royalty earned during the current monthly payment cycle will also be cancelled.",
  },
  {
    title: "4. Author Royalty",
    content: "Authors are entitled to receive 75% royalty on the selling price of each book after applicable payment-gateway deductions. The calculation is: (selling price − applicable MDR/TDR/other payment-gateway charges) × 75%.",
  },
  {
    title: "5. Royalty Payment",
    content: "Your applicable royalty will be paid to the bank account details provided by you during the author registration or subsequently updated through the permitted process. Royalty for a completed monthly cycle will be processed on or before the 10th day of the following month, subject to successful verification of the registered payment details.",
  },
  {
    title: "6. Changes to Bank Account Details",
    content: "Any changes to your registered bank account details must be submitted on or before the 25th day of the current month to facilitate timely royalty processing. Changes submitted after the 25th may not be considered for royalty payments relating to the current monthly payment cycle.",
  },
  {
    title: "7. Taxes and Statutory Obligations",
    content: "Shoppers Ocean will be responsible for paying the royalty amount payable to you in accordance with these policies. However, Shoppers Ocean will not be responsible for any taxes, duties, deductions, or other statutory obligations applicable to your royalty income under the laws of your country, state, or jurisdiction. You are solely responsible for complying with all applicable taxation requirements relating to the income received by you from Shoppers Ocean.",
  },
  {
    title: "8. Book Format and Appearance",
    content: "Books submitted by authors must be provided in PDF format only. Before submission, you are solely responsible for ensuring that your book is properly written, formatted, designed, and prepared, including appropriate fonts, spacing, page layout, images, and other visual elements. Once the PDF is converted into a digital flipbook, complaints relating to the original formatting, appearance, fonts, spacing, or design of the submitted book may not be entertained.",
  },
  {
    title: "9. Book and Cover Submission",
    content: "Once a book file and its cover image have been submitted and published, they cannot be changed or replaced. Shoppers Ocean reserves the right to withhold or cancel royalty associated with a book if the author subsequently attempts to modify, replace, or deliberately or accidentally delete the submitted book, subject to the circumstances and applicable policies.",
  },
  {
    title: "10. Originality and Prohibited Content",
    content: "Before submitting a book, you must ensure that it does not contain copied, plagiarised, unlawful, hateful, obscene, defamatory, or otherwise objectionable content. You are solely responsible for the content of your book and for any claims, complaints, disputes, or legal issues arising from it. By submitting your book, you confirm that the content complies with applicable laws and does not contain material that could reasonably result in a dispute or violation of another person's rights. Shoppers Ocean reserves the right to review and remove any book containing objectionable or prohibited material, whether such material is identified before or after publication.",
  },
  {
    title: "11. Ownership of Submitted Content",
    content: "All books submitted to Shoppers Ocean must consist of original content that you have the legal right to publish. You are solely responsible for establishing your ownership of, or legal rights to, the submitted content. Shoppers Ocean shall not be responsible for resolving disputes concerning copyright, ownership, authorship, or other rights relating to a book submitted by you.",
  },
  {
    title: "12. Royalty Statistics",
    content: "Authors can view their available royalty information through the Statistics section of their Shoppers Ocean author account. The statistics provided through the website may include relevant information regarding sales volume and royalty earnings. Apart from the information and functions made available through the Shoppers Ocean website, Shoppers Ocean is not obligated to provide additional reports or information upon individual requests.",
  },
  {
    title: "13. Misconduct and Prohibited Behaviour",
    content: "If an author submits objectionable content or engages in misconduct through website messages, reviews, communications, or any other interaction associated with Shoppers Ocean, we reserve the right to suspend or terminate the author's account. Shoppers Ocean may also restrict or permanently prevent the individual from registering or associating with the platform in the future.",
  },
  {
    title: "14. Book Size and Submission Requirements",
    content: "To manage storage and data consumption efficiently, Shoppers Ocean follows specific book-submission requirements for its flipbook system. Our flipbook design is optimized for approximately 70–80 words per page, excluding images. The following maximum file sizes apply: Book PDF: Maximum 4 MB. Book cover: Maximum 300 KB. Cover format: A commonly supported image format. Books or files that do not comply with these requirements may be rejected or disapproved by the Shoppers Ocean administration.",
  },
  {
    title: "15. Trending Books",
    content: "Books displayed in the Trending Books section are selected based on their sales performance during the current monthly cycle. Placement in the Trending Books section is determined by sales performance and is not available through special requests or personal arrangements.",
  },
];

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
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Welcome, Future Authors!</h2>
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
            <p>Please read our Author Policies carefully before registering. Once you are familiar with the policies, take the next step and become a valued member of the Shoppers Ocean authors and readers community.</p>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mt-14 mb-4">Author Policies</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            By registering as an author with Shoppers Ocean, you confirm that you have read, understood, and agreed to all of the following policies and terms:
          </p>

          <div className="space-y-7">
            {policies.map((policy) => (
              <div key={policy.title} className="border-b border-gray-200 pb-6">
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">{policy.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/create-your-flipbook/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-lg">
                Register as author
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
