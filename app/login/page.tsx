"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2Icon, ChevronDown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SubmitButton } from "./submit-button"
import { COUNTRIES } from "@/utils/countries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client-auth"

export default function Login({ searchParams }: { searchParams: any }) {
  const auth = createClient()
  const router = useRouter()
  // @ts-ignore
  const { accountCreated, type, authError } = React.use(searchParams)

  const [isSignIn, setIsSignIn] = useState(type === "signup" ? false : true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [country, setCountry] = useState("")
  const [countryQuery, setCountryQuery] = useState("")
  const [countryOpen, setCountryOpen] = useState(false)
  const [showAllCountries, setShowAllCountries] = useState(false)
  const [address, setAddress] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dialogState, setDialogState] = useState({ isOpen: false, title: "", description: "" })
  const showDialog = (title: string, description: string) => setDialogState({ isOpen: true, title, description })

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
      // Authenticate through the Cloudflare D1 API; it writes the JWT session cookie.
      const { error } = await auth.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setIsSubmitting(false)
        if (error.code === "account_not_found") {
          setErrors({ general: "Oh dear! Either the password or the email address is incorrect. Sorry, try again 😑" })
        } else if (error.code === "email_not_confirmed") {
          setErrors({ general: "Please confirm your email address and try again." })
        } else if (error.code === "invalid_credentials") {
          setErrors({ general: "Oh dear! Either the password or the email address is incorrect. Sorry, try again 😑" })
        } else {
          setErrors({ general: error.message || "An error occurred during sign in. Please try again." })
        }
        return
      }

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
      const { data, error } = await auth.auth.signUp({
        email: email.trim(),
        password,
        full_name: username.trim(),
        country,
      })

      setIsSubmitting(false)

      if (error) {
        if (error.message?.toLowerCase().includes("already")) {
          setErrors({ general: "An account with this email already exists. Please sign in or use a different email address." })
        } else {
          setErrors({ general: error.message || "An error occurred during sign up. Please try again." })
        }
        return
      }

      if (!data?.user) {
        setErrors({ general: "Unable to create your account. Please try again." })
        return
      }

      showDialog("Success", "Your account has been created successfully!")
      setIsSignIn(true)
    } catch (error: any) {
      setIsSubmitting(false)
      setErrors({ general: error?.message || "An error occurred during sign up. Please try again." })
    }
  }

  function getAuthErrorMessage(code: string) {
    if (code === "account_not_found") return "Oh dear! Either the password or the email address is incorrect. Sorry, try again 😑"
    if (code === "email_not_confirmed") return "Please confirm your email address and try again."
    if (code === "invalid_credentials") return "Oh dear! Either the password or the email address is incorrect. Sorry, try again 😑"
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
        <button type="button" onClick={() => router.back()} className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 text-sm font-normal not-italic text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Go back"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{isSignIn ? "Sign In" : "Create Account"}</h2>

        <div className="space-y-4">
          {accountCreated === "success" && <div className="bg-green-400 text-white p-2 rounded">Account created successfully. Please confirm your mail and login.</div>}
          {(authError || errors.general) && (isSignIn ? <div className="p-0 text-sm font-medium text-green-700 shadow-none">{authError ? getAuthErrorMessage(authError) : errors.general}</div> : <div className="bg-red-400 text-white p-2 rounded">{authError ? getAuthErrorMessage(authError) : errors.general}</div>)}

          {!isSignIn && (
            <>
              <div>
                <label htmlFor="name">{field("Name", true)}</label>
                <input id="name" className={`mt-1 w-full rounded-md border ${errors.username ? "border-red-500" : "border-gray-300"} px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-0 ${errors.username ? "focus:border-red-500" : "focus:border-gray-300"}`} placeholder="Your full name" autoComplete="name" value={username} onChange={e => { setUsername(e.target.value); setErrors(p => ({...p, username: ""})) }} />
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
              </div>

              <div className="relative">
                <label htmlFor="country">{field("Country", true)}</label>
                <div className="relative mt-1">
                  <input
                    id="country"
                    name="country"
                    autoComplete="off"
                    className={`w-full rounded-md border ${errors.country ? "border-red-500" : "border-gray-300"} px-4 py-2 pr-12 bg-white text-gray-900 focus:outline-none focus:ring-0 ${errors.country ? "focus:border-red-500" : "focus:border-gray-300"}`}
                    placeholder="Start typing your country"
                    value={countryQuery}
                    onChange={e => {
                      const value = e.target.value;
                      setCountryQuery(value);
                      const selected = COUNTRIES.find(c => c.name.toLowerCase() === value.trim().toLowerCase());
                      setCountry(selected?.code || "");
                      setErrors(p => ({...p, country: ""}));
                    }}
                    onFocus={() => { setCountryOpen(true); setShowAllCountries(false) }}
                  />
                  <button
                    type="button"
                    aria-label="Show all countries"
                    onClick={() => { setCountryOpen(true); setShowAllCountries(true) }}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                  {countryOpen && <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {COUNTRIES.filter(c => showAllCountries || !countryQuery.trim() || c.name.toLowerCase().startsWith(countryQuery.trim().toLowerCase())).map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountry(c.code);
                          setCountryQuery(c.name);
                          setErrors(prev => ({...prev, country: ""}));
                        }}
                        className="block w-full px-4 py-2 text-left text-sm font-normal italic text-gray-500 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="email">{field("Email", true)}</label>
            <input id="email" type="email" className={`mt-1 w-full rounded-md border ${errors.email ? "border-red-500" : "border-gray-300"} px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-0 ${errors.email ? "focus:border-red-500" : "focus:border-gray-300"}`} placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ""})) }} />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password">{field("Choose any password (minimum six letters/digits)", true)}</label>
            <div className="relative mt-1">
              <input id="password" type={showPassword ? "text" : "password"} className={`w-full rounded-md border ${errors.password ? "border-red-500" : "border-gray-300"} px-4 py-2 pr-12 bg-white text-gray-900 focus:outline-none focus:ring-0 ${errors.password ? "focus:border-red-500" : "focus:border-gray-300"}`} placeholder="Minimum 6 characters" required value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ""})) }} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-800">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {!isSignIn && (
            <>
              <div>
                <label htmlFor="address">{field("Complete Address", false)}</label>
                <textarea id="address" className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 min-h-24 focus:outline-none focus:ring-0 focus:border-gray-300" placeholder="Complete address (optional)" value={address} onChange={e => setAddress(e.target.value)} />
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
        <button type="button" onClick={() => { setIsSignIn(!isSignIn); setUsername(""); setEmail(""); setPassword(""); setCountry(""); setCountryQuery(""); setCountryOpen(false); setShowAllCountries(false); setAddress(""); setShowPassword(false); setErrors({}) }} className="w-full text-blue-600 text-sm font-medium text-center">{isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}</button>
        <div className="text-sm text-center mt-3"><Link href="/forgot-password" className="text-blue-600 font-medium">Forgot your password?</Link></div>
      </div>

      <Dialog open={dialogState.isOpen} onOpenChange={open => setDialogState(p => ({...p, isOpen: open}))}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{dialogState.title}</DialogTitle><DialogDescription>{dialogState.description}</DialogDescription></DialogHeader><div className="mt-4 flex justify-end"><Button onClick={() => setDialogState(p => ({...p, isOpen: false}))}>Close</Button></div></DialogContent>
      </Dialog>
    </div>
  )
}
