"use client"

import { SignIn, SignUp } from "@clerk/nextjs"

export default function ClerkMigrationAuth({ signUp }: { signUp: boolean }) {
  if (signUp) {
    return (
      <SignUp
        routing="hash"
        fallbackRedirectUrl="/"
        signInUrl="/login"
      />
    )
  }

  return (
    <SignIn
      routing="hash"
      fallbackRedirectUrl="/"
      signUpUrl="/login"
    />
  )
}
