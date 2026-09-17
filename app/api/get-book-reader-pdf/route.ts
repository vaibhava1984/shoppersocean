import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Not authorized', { status: 403 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    if (!bookId) return new NextResponse('Book ID is required', { status: 400 });

    const { data: purchase, error: purchaseError } = await supabase
      .from('orders')
      .select('id, status, payments!inner(status)')
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .eq('payments.status', 'completed')
      .limit(1)
      .maybeSingle();

    if (purchaseError || !purchase) return new NextResponse('Purchase required', { status: 403 });

    const { data: files, error: filesError } = await supabase
      .from('private_book_files')
      .select('file_path, file_name, file_type')
      .eq('book_id', bookId);
    if (filesError) throw filesError;

    const pdf = files?.find((file) => {
      const type = String(file.file_type || '').toLowerCase();
      const name = String(file.file_name || '').toLowerCase();
      return type === 'pdf' || name.endsWith('.pdf');
    });
    if (!pdf) return new NextResponse('No PDF book is available', { status: 404 });

    const { data: signed, error: signedError } = await supabase.storage
      .from('books-content')
      .createSignedUrl(pdf.file_path, 300);
    if (signedError || !signed?.signedUrl) throw signedError || new Error('Unable to create reader URL');

    const range = request.headers.get('range');
    const upstream = await fetch(signed.signedUrl, {
      headers: range ? { Range: range } : undefined,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse('Unable to load book', { status: upstream.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Cache-Control', 'private, no-store');
    headers.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    if (contentLength) headers.set('Content-Length', contentLength);
    if (contentRange) headers.set('Content-Range', contentRange);

    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    console.error('Error proxying purchased book PDF:', error);
    return new NextResponse('Failed to load book', { status: 500 });
  }
}
