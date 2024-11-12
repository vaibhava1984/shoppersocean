"use client"
import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { SubmitButton } from "./submit-button"
import { signIn, signUp } from "./actions"
import { COUNTRIES } from "@/utils/countries"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function Login({ searchParams }: {
  searchParams: any
}) {
  const supabase = createClient()
  const router = useRouter()

  // @ts-ignore
  const { accountCreated, type, authError } = React.use(searchParams)
  const [isSignIn, setIsSignIn] = useState(type === "signup" ? false : true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    country?: string;
    general?: string;
  }>({})
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    description: string
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.push('/')
      }
    })
  }, [])

  useEffect(() => {
    if (accountCreated === "success") {
      setIsSignIn(true)
    }
  }, [accountCreated])

  const showDialog = (title: string, description: string) => {
    setDialogState({
      isOpen: true,
      title,
      description,
    })
  }

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 5
  }

  const validateUsername = (username: string): boolean => {
    return username.length >= 2
  }

  const validateInputs = (isSigningIn: boolean): boolean => {
    const newErrors: typeof errors = {}
    let isValid = true

    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters long"
      isValid = false
    }

    if (!isSigningIn) {
      if (!username) {
        newErrors.username = "Name is required"
        isValid = false
      } else if (!validateUsername(username)) {
        newErrors.username = "Name must be at least 2 characters long"
        isValid = false
      }

      if (!country) {
        newErrors.country = "Country is required"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignIn = async () => {
    try {
      setIsSubmitting(true);
      if (!validateInputs(true)) {
        setIsSubmitting(false);
        return
      }

      const result = await signIn({
        email: email!,
        password: password!
      })

      // @ts-ignore
      if (result?.error) {
        setIsSubmitting(false);
        setErrors({ general: "Invalid email or password" })
        return
      }

      setIsSubmitting(false);
      showDialog("Success", "You have successfully signed in!")
    } catch (error) {
      setIsSubmitting(false);
      // @ts-ignore
      if (error?.message !== "NEXT_REDIRECT") {
        setErrors({ general: "An error occurred during sign in. Please try again." })
      }
    }
  }

  const handleSignUp = async () => {
    try {
      setIsSubmitting(true);
      if (!validateInputs(false)) {
        setIsSubmitting(false);
        return
      }

      const result = await signUp({
        email: email!,
        password: password!,
        fullName: username!,
        country: country! // Add country to signup payload
      })

      if (result?.error) {
        setIsSubmitting(false);
        setErrors({ general: "Error creating account. Email might already be in use." })
        return
      }

      setIsSubmitting(false);
      showDialog("Success", "Your account has been created successfully!")
    } catch (error) {
      setIsSubmitting(false);
      // @ts-ignore
      if (error?.message !== "NEXT_REDIRECT") {
        setErrors({ general: "An error occurred during sign up. Please try again." })
      }
    }
  }

  function getAuthErrorMessage(code: string) {
    if (code === "email_not_confirmed") {
      return "Please confirm your email address and try again."
    } else if (code === "invalid_credentials") {
      return "Invalid credentials"
    } else if (code === "reset_mail_expired") {
      return "Reset link expired. please try again."
    } else {
      return "Internal server error occurred"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-white hover:bg-white/10 flex items-center group text-sm transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />

        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          {isSignIn ? "Welcome Back!" : "Create Account"}
        </h2>

        <div className="space-y-4">
          {accountCreated === "success" && (
            <div className="bg-green-400 text-white p-2 rounded">
              Account created successfully. Please confirm your mail and login.
            </div>
          )}
          {(authError || errors.general) && (
            <div className="bg-red-400 text-white p-2 rounded">
              {authError ? getAuthErrorMessage(authError) : errors.general}
            </div>
          )}
          {!isSignIn && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Name
                </label>
                <input
                  className={`mt-1 w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors`}
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Your full name"
                  required={!isSignIn}
                  autoComplete="name"
                  value={username ?? ''}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setErrors(prev => ({ ...prev, username: undefined }))
                  }}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="country">
                  Country
                </label>
                <Select
                  value={country ?? ''}
                  onValueChange={(value) => {
                    setCountry(value)
                    setErrors(prev => ({ ...prev, country: undefined }))
                  }}
                >
                  <SelectTrigger className={`w-full text-black ${errors.country ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select your country" className="text-black" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className={`mt-1 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'
                } px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors`}
              name="email"
              type="email"
              id="email"
              placeholder="you@example.com"
              required
              autoComplete="new-email"
              spellCheck="false"
              value={email ?? ''}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors(prev => ({ ...prev, email: undefined }))
              }}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className={`mt-1 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'
                } px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors`}
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={password ?? ''}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors(prev => ({ ...prev, password: undefined }))
              }}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {isSignIn ? (
            <SubmitButton
              onClick={handleSignIn}
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium hover:bg-blue-700 transition-colors inline-flex ${isSubmitting ? 'opacity-40' : ''} hover:scale-101 hover:shadow-lg
                    active:scale-95 
                    transition-all duration-200
                    disabled:bg-gray-400`}
              pendingText="Signing In..."
            >
              {isSubmitting && (
                <span className="mr-2">
                  <Loader2Icon className="animate-spin" />
                </span>
              )}
              <span>
                {isSubmitting ? 'processing...' : 'Sign In'}
              </span>
            </SubmitButton>
          ) : (
            <SubmitButton
              onClick={handleSignUp}
              disabled={isSubmitting}
              className={`w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium hover:bg-blue-700 transition-colors inline-flex ${isSubmitting ? 'opacity-40' : ''} hover:scale-101 hover:shadow-lg
                    active:scale-95 
                    transition-all duration-200
                    disabled:bg-gray-400`}
              pendingText="Creating Account..."
            >
              {isSubmitting && (
                <span className="mr-2">
                  <Loader2Icon className="animate-spin" />
                </span>
              )}
              <span>
                {isSubmitting ? 'processing...' : 'Create Account'}
              </span>
            </SubmitButton>
          )}
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSignIn(!isSignIn)
            setUsername(null)
            setEmail(null)
            setPassword(null)
            setCountry(null)
            setErrors({})
          }}
          className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium text-center transition-colors"
        >
          {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        <div className="text-sm text-center">
          <Link
            href="/reset-password"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogDescription>{dialogState.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={closeDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}