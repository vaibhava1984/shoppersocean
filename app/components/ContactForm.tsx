"use client"
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ContactForm = () => {
    const [showThankYou, setShowThankYou] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // Track validation errors

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
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
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred, please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4 text-slate-800">Have a Question?</h2>
                <p className="text-xl mb-8 text-slate-600">
                    We're here to help! Reach out to us with any queries or suggestions.
                </p>

                {showThankYou ? (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <p className="text-2xl font-semibold text-blue-600">Thank you for your message!</p>
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
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : <><Mail className="mr-2 h-4 w-4" /> Send Message</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ContactForm;
