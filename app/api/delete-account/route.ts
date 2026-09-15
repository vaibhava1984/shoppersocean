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

    // Delete the authenticated user first. Account deletion must not depend on
    // Resend being available, otherwise an email configuration problem can
    // incorrectly prevent a user from deleting their account.
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting account:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Unable to delete your account. Please try again.' },
        { status: 500 }
      );
    }

    // Send the requested confirmation after the account has been deleted.
    // If delivery fails, the account remains deleted and the client is still
    // told that the deletion itself succeeded.
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY is not configured; account was deleted without confirmation email.');
      } else {
        const resend = new Resend(resendApiKey);
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
        } else {
          emailSent = true;
        }
      }
    } catch (emailError) {
      console.error('Unexpected account deletion email error:', emailError);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Unexpected account deletion error:', error);
    return NextResponse.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500 });
  }
}
