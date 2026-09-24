import { RedirectToSignIn } from "@clerk/nextjs";

export default function ResetPassword() {
  return <RedirectToSignIn redirectUrl="/sign-in" />;
}
