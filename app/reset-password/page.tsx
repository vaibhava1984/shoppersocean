"use client"
import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/utils/db/client"
import { useRouter } from "next/navigation"

export default function ResetPassword() {
    const supabase = createClient()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dialogState, setDialogState] = useState<{ isOpen: boolean; title: string; description: string }>({ isOpen: false, title: "", description: "" })

    const showDialog = (title: string, description: string) => setDialogState({ isOpen: true, title, description })
    const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }))

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`
            })

            if (error) {
                setError(error.message)
                return
            }

            showDialog("Check your email", "If an account exists with this email, you will receive a password reset link.")

            // Automatically close the confirmation popup and return to login.
            window.setTimeout(() => {
                closeDialog()
                router.push("/login")
            }, 1500)
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

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

            <Link href="/login" className="absolute left-4 sm:left-8 top-16 sm:top-20 py-2 px-4 rounded-md no-underline text-white hover:bg-white/10 flex items-center group text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"><polyline points="15 18 9 12 15 6" /></svg>
                Back to Login
            </Link>

            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden mt-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Reset Password</h2>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && <div className="bg-red-400 text-white p-2 rounded">{error}</div>}
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                        <input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors" name="email" type="email" id="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className={`w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium hover:bg-blue-700 transition-colors inline-flex ${isSubmitting ? "opacity-40" : ""} hover:scale-101 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400`}>
                        {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
            </div>

            <Dialog open={dialogState.isOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
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