import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to delete your account.' }, { status: 401 });
    }

    const email = user.email;
    if (!email) {
      return NextResponse.json({ error: 'Your account does not have an email address.' }, { status: 400 });
    }

    const name = String(user.user_metadata?.full_name ?? '').trim() || 'there';
    const safeName = escapeHtml(name);

    // Send the final confirmation before deleting the account so the message
    // is addressed to the email address that belongs to the account.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: 'no-reply@shoppersocean.com',
      to: email,
      subject: 'Your Shoppers Ocean account has been deleted',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #1e293b;">
          <p>Dear ${safeName},</p>
          <p>Sorry to see you go ! ☹️☹️</p>
          <p>Your account has been deleted successfully !</p>
          <p>Regards,<br />Shoppers Ocean</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending account deletion email:', emailError);
      return NextResponse.json(
        { error: 'We could not send the account deletion confirmation email, so your account was not deleted.' },
        { status: 502 }
      );
    }

    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting account:', deleteError);
      return NextResponse.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected account deletion error:', error);
    return NextResponse.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500 });
  }
}
