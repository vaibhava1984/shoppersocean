"use client"
import Link from "next/link"
import { SubmitButton } from "./submit-button"
import { signIn, signUp } from "./actions"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import React from "react"

export default function Login({ searchParams }: {
  searchParams: any
}) {
  // @ts-ignore
  const { message } = React.use(searchParams)
  const [isSignIn, setIsSignIn] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    description: string
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

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

  const handleSignIn = async () => {
    try {
      if (email && password) {
        await signIn({
          email: email,
          password: password
        })
        showDialog("Success", "You have successfully signed in!")
      }
    } catch (error) {
      showDialog("Error", "Failed to sign in. Please check your credentials and try again.")
    }
    const form = document.getElementById('loginForm') as HTMLFormElement
    if (form) form.reset()
  }

  const handleSignUp = async () => {
    try {
      if (email && password && username) {
        await signUp({
          email,
          password,
          fullName: username
        })
        showDialog("Success", "Your account has been created successfully!")
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Account already exists") {
        showDialog("Account Exists", "An account with this email already exists. Please sign in instead.")
      } else {
        showDialog("Error", "Failed to create account. Please try again later.")
      }
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
          {!isSignIn && (
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="name">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
                name="name"
                type="text"
                id="name"
                placeholder="Your full name"
                required={!isSignIn}
                autoComplete="name"
                value={username ?? ''}
                onChange={(e) => {
                  setUsername(e.target.value)
                }}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
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
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={password ?? ''}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
            />
          </div>

          {isSignIn ? (
            <SubmitButton
              onClick={handleSignIn}
              className="bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
              pendingText="Signing In..."
            >
              Sign In
            </SubmitButton>
          ) : (
            <SubmitButton
              onClick={handleSignUp}
              className="bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
              pendingText="Creating Account..."
            >
              Create Account
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
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium text-center transition-colors"
        >
          {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        {message && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md">
            {message}
          </div>
        )}
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