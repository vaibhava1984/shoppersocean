import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY); // Use environment variable for security

export async function POST(request: Request) {
    try {
        // Parse incoming JSON body
        const { name, email, message } = await request.json();

        // 1. Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'All fields are required (name, email, message).' },
                { status: 400 }
            );
        }

        // 2. Validate email format (using a simple regex)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // 3. Validate message length (basic example)
        if (message.length < 10) {
            return NextResponse.json(
                { error: 'Message must be at least 10 characters long.' },
                { status: 400 }
            );
        }

        // 4. Sanitize inputs (optional, but recommended for security)
        const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // basic XSS protection (simple sanitization)

        // Send email to your email address using Resend
        const yourEmail = "ajanyakshay16@gmail.com"; // Replace with your actual email address

        const response = await resend.emails.send({
            from: 'onboarding@resend.dev', // Sender email
            to: yourEmail, // Send to your own email address
            subject: 'New Message Submission | Shoppers Ocean', // Customize the subject line
            html: `
                <p><strong>New Message Submitted:</strong></p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${sanitizedMessage}</p>
            `, // Customize the HTML content of the email
        });

        // Return success response
        return NextResponse.json({ message: 'Email sent successfully to your email' }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
