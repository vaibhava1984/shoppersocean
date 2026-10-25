import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth/session";
import AuthorRegistrationGate from "../create-your-flipbook/AuthorRegistrationGate";

export const metadata = {
  title: "Submit Your Book",
  description: "Submit a manuscript and cover page as a registered Shoppers Ocean author.",
};

export default async function SubmitYourBookPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.publicMetadata?.userrole === "ADMIN";
  const isRegisteredAuthor = Boolean(user?.publicMetadata?.isAuthor);

  if (!user || isAdmin || !isRegisteredAuthor) redirect("/create-your-flipbook");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="bg-white py-8">
        <AuthorRegistrationGate>{null}</AuthorRegistrationGate>
      </main>
      <Footer />
    </div>
  );
}
