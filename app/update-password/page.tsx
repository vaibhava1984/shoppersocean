"use client"
import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/db/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function UpdatePassword() {
  const auth = createClient().auth
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState({ isOpen: false, title: "", description: "" })

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) { setError("Invalid or expired reset link"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters long"); return }
    setIsSubmitting(true)
    try {
      const result = await (auth as any).updatePasswordWithToken(token, password)
      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : result.error.message || "Unable to reset password.")
        return
      }
      setDialogState({ isOpen: true, title: "Success", description: "Your password has been updated successfully. Please sign in with your new password." })
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        <Link href="/login" className="text-blue-600 text-sm">← Back to Login</Link>
        <h2 className="text-2xl font-bold text-gray-800 my-8 text-center">Update Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {error && <div className="bg-red-400 text-white p-2 rounded">{error}</div>}
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="password">New Password</label>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirm New Password</label>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium">
            {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
      <Dialog open={dialogState.isOpen} onOpenChange={open => { if (!open) router.push("/login") }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{dialogState.title}</DialogTitle><DialogDescription>{dialogState.description}</DialogDescription></DialogHeader>
          <div className="mt-4 flex justify-end"><Button onClick={() => router.push("/login")}>Continue to Login</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
