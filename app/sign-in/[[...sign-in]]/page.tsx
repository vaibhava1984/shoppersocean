"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"
import { COUNTRIES } from "@/utils/countries"

export default function SignInPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [country, setCountry] = useState("IN")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (!email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address"
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 letters/digits"
    if (!isSignIn && !username.trim()) return "Name is required"
    if (!isSignIn && !country) return "Country is required"
    return ""
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(isSignIn ? "/api/auth/sign-in" : "/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignIn
            ? { email: email.trim(), password }
            : { name: username.trim(), country, email: email.trim(), password }
        ),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (isSignIn ? "Unable to sign in." : "Unable to create your account."))
        return
      }

      window.location.href = "/"
    } catch {
      setError(isSignIn ? "Unable to sign in right now. Please try again." : "Unable to create your account right now. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode() {
    setIsSignIn(!isSignIn)
    setUsername("")
    setEmail("")
    setPassword("")
    setCountry("IN")
    setError("")
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

        <form onSubmit={submit} className="space-y-4">
          {error && <div className="bg-red-400 text-white p-2 rounded">{error}</div>}

          {!isSignIn && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="name">Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
                  id="name"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="country">Country</label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900"
                >
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center hover:scale-101 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400"
          >
            {isSubmitting && <Loader2Icon className="mr-2 animate-spin" />}
            <span>{isSubmitting ? "processing..." : isSignIn ? "Sign In" : "Create Account"}</span>
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
        </div>

        <button
          type="button"
          onClick={switchMode}
          className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium text-center transition-colors"
        >
          {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="text-sm text-center mt-1">
          <Link href="/reset-password" className="text-blue-600 hover:text-blue-700 font-medium">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}
