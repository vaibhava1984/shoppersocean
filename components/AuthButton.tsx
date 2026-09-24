import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const user = await currentUser();

  const signOut = async () => {
    "use server";
    const { sessionId } = await auth();
    if (sessionId) {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    }
    redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.emailAddresses?.[0]?.emailAddress}!
      <form action={signOut}>
        <button className="py-2 px-4 rounded-md no-underline bg-blue-600 text-white hover:bg-blue-700">Logout</button>
      </form>
    </div>
  ) : (
    <Link href="/login" className="py-2 px-3 flex rounded-md no-underline bg-blue-600 text-white hover:bg-blue-700">Login</Link>
  );
}
