import AuthButton from "@/components/AuthButton";
import Header from "@/components/Header";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center text-white">
          This is a protected page that you can only see as an authenticated user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <AuthButton />
          </div>
        </nav>
      </div>
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <Header />
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl mb-4">Authenticated</h2>
          <p>You are signed in successfully.</p>
        </main>
      </div>
    </div>
  );
}
