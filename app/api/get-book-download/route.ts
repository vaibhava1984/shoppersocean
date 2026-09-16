import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    // The order itself is marked completed by the verified Razorpay payment.
    // Use the same purchase rule everywhere so the page, reader and download
    // cannot disagree about whether the customer owns the book.
    const { data: purchase, error: purchaseError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    if (purchaseError || !purchase) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const admin = createAdminClient();
    const { data: privateBookPaths, error: privateBookPathsError } = await admin
      .from('private_book_files')
      .select('file_path, file_name, file_type')
      .eq('book_id', bookId);
    if (privateBookPathsError) throw privateBookPathsError;
    if (!privateBookPaths?.length) return NextResponse.json({ error: 'Files not found' }, { status: 404 });

    const { data: signedUrls, error: signedUrlError } = await admin
      .storage.from('books-content').createSignedUrls(privateBookPaths.map(p => p.file_path), 300);
    if (signedUrlError) throw signedUrlError;

    const urls = (signedUrls || []).map(d => {
      const file = privateBookPaths.find(p => p.file_path === d.path);
      return file && d.signedUrl ? { downloadUrl: d.signedUrl, fileType: file.file_type, fileName: file.file_name } : null;
    }).filter(Boolean);

    if (!urls.length) return NextResponse.json({ error: 'Book file is unavailable in storage' }, { status: 404 });
    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
