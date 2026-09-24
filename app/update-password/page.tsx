import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export default async function UpdatePassword() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <UpdatePasswordForm />;
}
