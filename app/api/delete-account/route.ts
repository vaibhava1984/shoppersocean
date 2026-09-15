import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
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
    const admin = createAdminClient();

    // Remove application-owned rows first. These operations are best-effort so
    // an optional table or older installation cannot prevent Auth deletion.
    for (const table of ['user_roles', 'testimonials', 'orders', 'authors']) {
      try {
        const { error } = await admin.from(table).delete().eq('user_id', user.id);
        if (error) console.error(`Non-blocking ${table} cleanup error:`, error);
      } catch (error) {
        console.error(`Non-blocking ${table} cleanup exception:`, error);
      }
    }

    // Supabase also blocks hard deletion when the Auth user owns Storage objects.
    // Remove every object owned by this user, grouped by bucket.
    try {
      const { data: ownedObjects, error: storageQueryError } = await admin
        .from('storage.objects')
        .select('bucket_id, name')
        .eq('owner', user.id);

      if (storageQueryError) {
        console.error('Non-blocking storage ownership lookup error:', storageQueryError);
      } else if (ownedObjects?.length) {
        const byBucket = new Map<string, string[]>();
        for (const object of ownedObjects) {
          const names = byBucket.get(object.bucket_id) ?? [];
          names.push(object.name);
          byBucket.set(object.bucket_id, names);
        }

        for (const [bucket, names] of byBucket) {
          try {
            const { error } = await admin.storage.from(bucket).remove(names);
            if (error) console.error(`Non-blocking storage cleanup error for ${bucket}:`, error);
          } catch (error) {
            console.error(`Non-blocking storage cleanup exception for ${bucket}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Non-blocking storage cleanup exception:', error);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting account:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Unable to delete your account. Please try again.' },
        { status: 500 }
      );
    }

    // Confirmation email is best-effort and must never prevent account deletion.
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
