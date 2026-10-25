"use client"
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ContactForm = ({
    user,
    title = 'Have a Question?',
    description = "We're here to help! Reach out to us with any queries or suggestions.",
    successMessage = 'Thank you for your message!',
    hideDescription = false,
}: {
    title?: string,
    description?: string,
    successMessage?: string,
    hideDescription?: boolean,
    user?: any,
}) => {
    const [showThankYou, setShowThankYou] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // Track validation errors
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const handleDeleteAccount = async () => {
        if (isDeletingAccount) return;
        const confirmed = window.confirm(
            'Are you sure you want to permanently delete your Shoppers Ocean account? This action cannot be undone.'
        );
        if (!confirmed) return;
        setIsDeletingAccount(true);
        try {
            const response = await fetch('/api/delete-account', { method: 'POST' });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Unable to delete your account. Please try again.');
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
            window.alert('Your account has been deleted successfully !');
            window.location.href = '/';
        } catch (err) {
            console.error('Account deletion failed:', err);
            window.alert(err instanceof Error ? err.message : 'Unable to delete your account. Please try again.');
            setIsDeletingAccount(false);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email') as string;
        const message = formData.get('message');

        // Basic Validation
        if (!name || !email || !message) {
            setErrorMessage('Please fill out all fields.');
            return;
        }

        // Email Validation (basic regex check)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        // Clear any previous error messages
        setErrorMessage('');

        try {
            setIsSubmitting(true);

            // Send the form data to the backend API
            const response = await fetch('/api/contact-me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                }),
            });
            const responseJson = await response.json()

            if (!response.ok) {
                // console.log("response=>", responseJson)
                throw new Error(responseJson?.error ?? 'Something went wrong, please try again later.');
            }

            // Show the thank you message
            setShowThankYou(true);
        } catch (error: any) {
            setErrorMessage(error?.message || 'An error occurred, please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                {title && (
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
                )}
                {!hideDescription && (
                    <p className="text-xl mb-8 text-slate-600">
                        {description}
                    </p>
                )}

                {showThankYou ? (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <p className="text-2xl font-semibold text-blue-600">{successMessage}</p>
                            <p className="mt-2 text-slate-600">We'll get back to you shortly.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    name="name"
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Your Email"
                                    required
                                />
                                <Textarea
                                    name="message"
                                    placeholder="Your Message"
                                    required
                                    className="min-h-[100px]"
                                />

                                {errorMessage && (
                                    <p className="text-red-600">{errorMessage}</p>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:scale-101 hover:shadow-lg
                    active:scale-95 
                    transition-all duration-200
                    disabled:bg-gray-400"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : <><Mail className="mr-2 h-4 w-4" /> Send Message</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
                {user && (
                    <div className="mt-4 flex justify-center">
                        <button type="button" onClick={handleDeleteAccount} disabled={isDeletingAccount}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                            {isDeletingAccount ? 'Deleting account...' : 'delete my account'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactForm;
