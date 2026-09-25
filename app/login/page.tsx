"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { SubmitButton } from "./submit-button"
import { signIn, signUp } from "./actions"
import { COUNTRIES } from "@/utils/countries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { getFirebaseApp } from "@/lib/firebase/client"

export default function Login({ searchParams }: { searchParams: any }) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const accountCreated = searchParamsHook.get("accountCreated")
  const type = searchParamsHook.get("type")
  const authError = searchParamsHook.get("authError")

  const [isSignIn, setIsSignIn] = useState(type === "signup" ? false : true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [country, setCountry] = useState("")
  const [mobile, setMobile] = useState("")
  const [address, setAddress] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dialogState, setDialogState] = useState({ isOpen: false, title: "", description: "" })

  const showDialog = (title: string, description: string) =>
    setDialogState({ isOpen: true, title, description })

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const validatePassword = (value: string) => value.length >= 6

  const validateInputs = (signingIn: boolean) => {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = "Email is required"
    else if (!validateEmail(email.trim())) next.email = "Please enter a valid email address"
    if (!password) next.password = "Password is required"
    else if (!validatePassword(password)) next.password = "Password must be at least 6 letters/digits"
    if (!signingIn) {
      if (!username.trim()) next.username = "Name is required"
      if (!country) next.country = "Country is required"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSignIn = async () => {
    setIsSubmitting(true)
    if (!validateInputs(true)) {
      setIsSubmitting(false)
      return
    }
    try {
      const credential = await (await import("firebase/auth")).signInWithEmailAndPassword(getAuth(getFirebaseApp()), email.trim(), password)
      const idToken = await credential.user.getIdToken(true)
      const sessionResponse = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) })
      if (!sessionResponse.ok) throw new Error("Unable to create secure session")
      await router.replace("/")
    } catch (error: any) {
      setIsSubmitting(false)
      setErrors({ general: error?.message || "An error occurred during sign in. Please try again." })
    }
  }

  const handleSignUp = async () => {
    setIsSubmitting(true)
    if (!validateInputs(false)) {
      setIsSubmitting(false)
      return
    }
    try {
      const result = await signUp({
        email: email.trim(),
        password,
        fullName: username.trim(),
        country,
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
      })
      setIsSubmitting(false)
      if (result?.error) {
        if (result.error === "account_already_registered") setErrors({ general: "An account with this email already exists. Please sign in or use a different email address." })
        else setErrors({ general: result.error })
        return
      }
      if (result?.token) {
        const credential = await signInWithCustomToken(getAuth(getFirebaseApp()), result.token)
        const idToken = await credential.user.getIdToken(true)
        const sessionResponse = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken }) })
        if (!sessionResponse.ok) throw new Error("Unable to create secure session")
      }
      showDialog("Success", "Your account has been created successfully!")
      setIsSignIn(true)
    } catch (error: any) {
      setIsSubmitting(false)
      if (error?.message !== "NEXT_REDIRECT") setErrors({ general: "An error occurred during sign up. Please try again." })
    }
  }

  function getAuthErrorMessage(code: string) {
    if (code === "email_not_confirmed") return "Please confirm your email address and try again."
    if (code === "invalid_credentials") return "Invalid credentials"
    if (code === "account_already_registered") return "An account with this email already exists. Please sign in or use a different email address."
    return "Internal server error occurred"
  }

  const field = (label: string, required: boolean) => (
    <span className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</span>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center p-4 pt-28">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
            {[["/", "Home"], ["/bookShelf", "Bookshelf"], ["/about", "About"], ["/contact", "Have a question"]].map(([href, label]) => (
              <Link key={href} href={href} className="flex-1 min-w-0 text-center px-2 py-2 rounded-md text-xs sm:text-sm font-medium text-white hover:bg-white/15 transition-colors whitespace-nowrap">{label}</Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{isSignIn ? "Sign In" : "Create Account"}</h2>
        <div className="space-y-4">
          {accountCreated === "success" && <div className="bg-green-400 text-white p-2 rounded">Account created successfully. You can now sign in.</div>}
          {(authError || errors.general) && <div className="bg-red-400 text-white p-2 rounded">{authError ? getAuthErrorMessage(authError) : errors.general}</div>}

          {!isSignIn && (
            <>
              <div>
                <label htmlFor="name">{field("Name", true)}</label>
                <input id="name" className={`mt-1 w-full rounded-md border ${errors.username ? "border-red-500" : "border-gray-300"} px-4 py-2 bg-white text-gray-900`} placeholder="Your full name" autoComplete="name" value={username} onChange={e => { setUsername(e.target.value); setErrors(p => ({...p, username: ""})) }} />
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
              </div>
              <div>
                <label htmlFor="country">{field("Country", true)}</label>
                <Select value={country} onValueChange={v => { setCountry(v); setErrors(p => ({...p, country: ""})) }}>
                  <SelectTrigger className={`w-full text-black mt-1 ${errors.country ? "border-red-500" : ""}`}><SelectValue placeholder="Select your country" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="email">{field("Email", true)}</label>
            <input id="email" type="email" className={`mt-1 w-full rounded-md border ${errors.email ? "border-red-500" : "border-gray-300"} px-4 py-2 bg-white text-gray-900`} placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ""})) }} />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password">{field("Choose any password (minimum six letters/digits)", true)}</label>
            <input id="password" type="password" className={`mt-1 w-full rounded-md border ${errors.password ? "border-red-500" : "border-gray-300"} px-4 py-2 bg-white text-gray-900`} placeholder="Minimum 6 characters" required value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ""})) }} />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {!isSignIn && (
            <>
              <div>
                <label htmlFor="mobile">{field("Mobile", false)}</label>
                <input id="mobile" type="tel" inputMode="tel" className="w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 mt-1" placeholder="+91XXXXXXXXXX" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div>
                <label htmlFor="address">{field("Complete Address", false)}</label>
                <textarea id="address" className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 min-h-24" placeholder="Complete address (optional)" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </>
          )}

          {isSignIn ? (
            <SubmitButton onClick={handleSignIn} disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium" pendingText="Signing In...">
              {isSubmitting && <Loader2Icon className="mr-2 animate-spin" />}<span>{isSubmitting ? "Processing..." : "Sign In"}</span>
            </SubmitButton>
          ) : (
            <SubmitButton onClick={handleSignUp} disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium" pendingText="Creating Account...">
              {isSubmitting && <Loader2Icon className="mr-2 animate-spin" />}<span>{isSubmitting ? "Processing..." : "Create Account"}</span>
            </SubmitButton>
          )}
        </div>

        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div></div>
        <button type="button" onClick={() => { setIsSignIn(!isSignIn); setUsername(""); setEmail(""); setPassword(""); setCountry(""); setMobile(""); setAddress(""); setErrors({}) }} className="w-full text-blue-600 text-sm font-medium text-center">{isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}</button>
        <div className="text-sm text-center mt-3"><Link href="/reset-password" className="text-blue-600 font-medium">Forgot your password?</Link></div>
      </div>

      <Dialog open={dialogState.isOpen} onOpenChange={open => setDialogState(p => ({...p, isOpen: open}))}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{dialogState.title}</DialogTitle><DialogDescription>{dialogState.description}</DialogDescription></DialogHeader><div className="mt-4 flex justify-end"><Button onClick={() => setDialogState(p => ({...p, isOpen: false}))}>Close</Button></div></DialogContent>
      </Dialog>
    </div>
  )
}
