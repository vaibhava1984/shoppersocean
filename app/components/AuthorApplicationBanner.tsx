'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from "@/utils/supabase/client";
import ContactForm from '../components/ContactForm';

export default function AuthorApplicationBanner() {
    const supabase = createClient();
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isContactFormOpen, setIsContactFormOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        const checkauthors = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();
            if (user?.app_metadata?.isAuthor === true) {
                setIsAuthor(true);
                setIsVisible(false);
            } else {
                const timer = setTimeout(() => setIsVisible(true), 1000);
                return () => clearTimeout(timer);
            }
        }
        checkauthors();
    }, [])



    const handleConfirm = async () => {
        const { data, error } = await supabase.from('authors_interest_submission').insert({});
        if (error) {
            console.error('Error fetching authors:', error);
        } else {
            toast({
                title: "Success!",
                description: "We'll send you an follow up mail within next 24 hours.",
            })
            setIsOpen(false)
        }
    }

    return (
        <>
            <Toaster />
            {!isAuthor && (
                <div
                    className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                        }`}
                >
                    <div className="animate-bounce">
                        {/* <Button
                            variant="outline"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-lg"
                            onClick={() => setIsOpen(true)}
                        >
                            Are you an author?
                        </Button> */}
                        <Button
                            variant="outline"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-lg"
                            onClick={() => setIsContactFormOpen(true)}
                        >
                            Are you an author?
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to register as an author?.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
                <DialogContent className='bg-white overflow-y-auto max-h-[85%]'>
                    <DialogHeader>
                        <DialogTitle className='hidden'>Confirm Application</DialogTitle>
                    </DialogHeader>
                    <div>
                        <ContactForm title='Are you an Author?' hideDescription successMessage="Thank you for your interest" />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}