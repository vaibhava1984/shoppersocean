import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

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

    const { data: privateBookPaths, error: privateBookPathsError } = await supabase
      .from('private_book_files')
      .select('file_path, file_name, file_type')
      .eq('book_id', bookId);
    if (privateBookPathsError) throw privateBookPathsError;
    if (!privateBookPaths?.length) return NextResponse.json({ error: 'Files not found' }, { status: 404 });

    const { data: signedUrls, error: signedUrlError } = await supabase
      .storage.from('books-content').createSignedUrls(privateBookPaths.map(p => p.file_path), 300);
    if (signedUrlError) throw signedUrlError;

    const urls = (signedUrls || []).map(d => {
      const file = privateBookPaths.find(p => p.file_path === d.path);
      return file ? { downloadUrl: d.signedUrl, fileType: file.file_type, fileName: file.file_name } : null;
    }).filter(Boolean);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
