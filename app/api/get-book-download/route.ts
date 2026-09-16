import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    const { data: purchase, error: purchaseError } = await supabase
      .from('orders')
      .select('id, status, payments!inner(status)')
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .eq('payments.status', 'completed')
      .limit(1)
      .maybeSingle();

    if (purchaseError || !purchase) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    // File metadata and storage are protected resources. Use the trusted
    // server client after the purchase has already been verified above.
    const admin = createAdminClient();
    const { data: privateBookPaths, error: privateBookPathsError } = await admin
      .from('private_book_files')
      .select('file_path, file_name, file_type')
      .eq('book_id', bookId);

    if (privateBookPathsError) throw privateBookPathsError;
    if (!privateBookPaths?.length) return NextResponse.json({ error: 'Files not found' }, { status: 404 });

    const urls = [];
    for (const file of privateBookPaths) {
      if (!file.file_path) continue;
      const { data: signed, error: signedError } = await admin.storage
        .from('books-content')
        .createSignedUrl(file.file_path, 300);
      if (signedError || !signed?.signedUrl) {
        console.error('Could not sign book file:', file.file_path, signedError);
        continue;
      }
      urls.push({
        downloadUrl: signed.signedUrl,
        fileType: file.file_type,
        fileName: file.file_name,
      });
    }

    if (!urls.length) return NextResponse.json({ error: 'Book file is missing from storage' }, { status: 404 });
    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
