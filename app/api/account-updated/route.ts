import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'no-reply@shoppersocean.com',
      to: email,
      subject: 'Your Shoppers Ocean account details have been updated',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <p>Dear ${String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')},</p>
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
