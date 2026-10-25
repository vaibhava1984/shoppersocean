import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth/session";
import AuthorRegistrationAction from "@/components/AuthorRegistrationAction";

export const metadata = {
  title: "Author Policies",
  description: "Author registration policies and terms for Shoppers Ocean.",
};

const policies = [
  {
    title: "1. One-Time Lifetime Registration",
    content: "A one-time registration fee of ₹250 applies to authors registering in India. This fee covers lifetime author registration with Shoppers Ocean, and no recurring registration fee will be charged.",
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
    content: "Your applicable royalty will be paid to the bank account details provided by you during author registration or subsequently updated through the permitted process. Royalty for a completed monthly cycle will be processed on or before the 10th day of the following month, subject to successful verification of your registered bank account details.",
  },
  {
    title: "6. Changes to Bank Account Details",
    content: "Any changes to your registered bank account details made on or before the 25th day of the month will apply to that month’s royalty payment. Changes made after the 25th will take effect from the following month’s royalty processing.",
  },
  {
    title: "7. Taxes and Statutory Obligations",
    content: "Shoppers Ocean will be responsible for paying the royalty amount payable to you in accordance with these policies. However, Shoppers Ocean will not be responsible for any taxes, duties, deductions, or other statutory obligations applicable to your royalty income under the laws of your country, state, or jurisdiction. You are solely responsible for complying with all applicable taxation requirements relating to the income received by you from Shoppers Ocean.",
  },
  {
    title: "8. Book Format and Appearance",
    content: "Books must be submitted in DOCX format and contain text only. Books containing images or hyperlinks will not be approved. Authors are responsible for ensuring that the text is complete, properly written, and ready for publication before submission. Once the submitted Word file is converted into a flipbook, requests or complaints concerning the original formatting, fonts, spacing, or layout may not be entertained.",
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
    content: "To maintain consistent publishing standards and ensure efficient processing, each submitted book must contain no more than 15,000 words. Submissions exceeding this limit will not be accepted for publication. The following maximum file sizes also apply: book manuscript in DOCX format: 2 MB; book cover: 200 KB. Accepted cover formats are JPG, PNG, and WebP. Submissions that do not meet these requirements may be rejected by the Shoppers Ocean administration.",
  },
  {
    title: "15. Trending Books",
    content: "Books displayed in the Trending Books section are selected based on their sales performance during the current monthly cycle. Placement in the Trending Books section is determined by sales performance and is not available through special requests or personal arrangements.",
  },
  {
    title: "16. Maximum Book Price",
    content: "To help keep books affordable for our national and global customers, Shoppers Ocean has established maximum book-price limits. Authors from India may set a maximum selling price of ₹150 per book. Authors from outside India may set a maximum selling price of US$3 per book.",
  },
];

export default async function AuthorPoliciesPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.publicMetadata?.userrole === "ADMIN";
  const isRegisteredAuthor = Boolean(user?.publicMetadata?.isAuthor);
  const showRegisterButton = !isAdmin && !isRegisteredAuthor;
  const showSubmitButton = !isAdmin && isRegisteredAuthor;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 id="author-policies" className="scroll-mt-24 text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Author Policies</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            By registering as an author with Shoppers Ocean, you confirm that you have read, understood, and agreed to all of the following policies and terms:
          </p>
          <div className="space-y-7">
            {policies.map((policy) => (
              <div key={policy.title} className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">{policy.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>
          {(showRegisterButton || showSubmitButton) && (
            <div className="mt-12 text-center">
              {showSubmitButton ? (
                <Link href="/submit-your-book" className="inline-flex min-h-11 items-center justify-center rounded-md bg-green-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                  Submit Your Book
                </Link>
              ) : (
                <AuthorRegistrationAction isLoggedIn={Boolean(user)} />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
