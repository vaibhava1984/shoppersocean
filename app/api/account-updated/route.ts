import { Resend } from "@/utils/email/resend";
import { NextResponse } from 'next/server';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const safeName = escapeHtml(String(name));
    const { error } = await resend.emails.send({
      from: 'no-reply@shoppersocean.com',
      to: String(email),
      subject: 'Your Shoppers Ocean account details have been updated',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <p>Hi ${safeName}!</p>
          <p>Your details have been successfully updated.</p>
          <p>Thank you for using Shoppers Ocean.</p>
          <p>Regards,<br />Shoppers Ocean</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending account update email:', error);
      return NextResponse.json({ error: 'Details were updated, but the confirmation email could not be sent.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected account update email error:', error);
    return NextResponse.json({ error: 'Unable to send confirmation email.' }, { status: 500 });
  }
}
