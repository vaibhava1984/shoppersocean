import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  redirect(params?.type === "signup" ? "/sign-up" : "/sign-in");
}
