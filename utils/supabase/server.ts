import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseConfig();
  return createServerClient(url, anonKey, {
    cookies: {
      async getAll() { return (await cookieStore).getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(async ({ name, value, options }) => (await cookieStore).set(name, value, options));
        } catch {}
      },
    },
  });
}

export const getUser = cache(async () => {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.emailAddresses?.[0]?.emailAddress ?? null,
    phone: user.phoneNumbers?.[0]?.phoneNumber ?? null,
    user_metadata: {
      full_name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      country: user.unsafeMetadata?.country ?? "",
      address: user.unsafeMetadata?.address ?? "",
    },
    app_metadata: {
      userrole: user.publicMetadata?.userrole,
      isAuthor: user.publicMetadata?.isAuthor === true,
    },
  };
});
