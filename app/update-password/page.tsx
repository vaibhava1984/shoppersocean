"use client"
import { useState, useEffect } from "react"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function UpdatePassword() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dialogState, setDialogState] = useState<{ isOpen: boolean; title: string; description: string }>({ isOpen: false, title: "", description: "" })

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) router.push('/login?authError=reset_mail_expired')
        }
        checkSession()
    }, [router])

    const showDialog = (title: string, description: string) => setDialogState({ isOpen: true, title, description })
    const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }))

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (password !== confirmPassword) { setError("Passwords do not match"); return }
        if (password.length < 6) { setError("Password must be at least 6 characters long"); return }
        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password })
            if (error) setError(error.message)
            else {
                showDialog("Success", "Your password has been updated successfully. Redirecting to HomePage.")
                setTimeout(async () => {
                    const { error } = await supabase.auth.signOut()
                    if (error) alert('Unexpected error occured')
                    else window.location.href = "/"
                }, 4000)
            }
        } catch (err) { setError("An error occurred. Please try again.") }
        finally { setIsSubmitting(false) }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Update Password</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {error && <div className="bg-red-400 text-white p-2 rounded">{error}</div>}
                    <div><label className="text-sm font-medium text-gray-700" htmlFor="password">New Password</label><input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
                    <div><label className="text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirm New Password</label><input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-colors" type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} /></div>
                    <Button type="submit" disabled={isSubmitting} className={`w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium hover:bg-blue-700 transition-colors inline-flex ${isSubmitting ? "opacity-40" : ""} hover:scale-101 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400`}>{isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{isSubmitting ? "Updating..." : "Update Password"}</Button>
                </form>
            </div>
            <Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{dialogState.title}</DialogTitle><DialogDescription>{dialogState.description}</DialogDescription></DialogHeader><div className="mt-4 flex justify-end"><Button onClick={closeDialog}>Close</Button></div></DialogContent>
            </Dialog>
        </div>
    )
}