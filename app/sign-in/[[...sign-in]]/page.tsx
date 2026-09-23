import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            card: "shadow-xl",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          },
        }}
      />
    </div>
  );
}
