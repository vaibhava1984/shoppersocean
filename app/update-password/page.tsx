import { getCurrentUser } from "@/utils/auth/session";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export default async function UpdatePassword(){
 const user=await getCurrentUser();
 if(!user) redirect("/sign-in");
 return <UpdatePasswordForm />;
}
