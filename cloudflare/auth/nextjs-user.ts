import { auth, currentUser } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { upsertUserFromClerk, type D1User } from "@/cloudflare/db/users";

export type NextAuthUser = {
  clerkUserId: string;
  email: string;
  fullName: string;
  d1User: D1User | null;
};

export async function getMigrationAuthUser(): Promise<NextAuthUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const fullName = clerkUser.fullName ?? clerkUser.firstName ?? "";

  let d1User: D1User | null = null;
  try {
    const { env } = getCloudflareContext();
    d1User = await upsertUserFromClerk(env, {
      clerkUserId: userId,
      email,
      fullName,
    });
  } catch (error) {
    console.error("Clerk/D1 identity association is unavailable:", error);
  }

  return { clerkUserId: userId, email, fullName, d1User };
}
