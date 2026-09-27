import { NextResponse } from 'next/server';
import { createClient } from '@/utils/db/server';
import { getBookFileUrl } from '@/utils/storage';

export async function GET(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return new NextResponse('Not authorized', { status: 403 });

    const bookId = new URL(request.url).searchParams.get('bookId');
    if (!bookId) return new NextResponse('Book ID is required', { status: 400 });

    const { data: purchase, error: purchaseError } = await db
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchaseError || !purchase) return new NextResponse('Purchase required', { status: 403 });

    const { data: files, error: filesError } = await db
      .from('private_book_files')
      .select('storage_key, file_name, mime_type')
      .eq('book_id', bookId);
    if (filesError) throw filesError;

    const pdf = (files || []).find((file: any) => {
      const type = String(file.mime_type || '').toLowerCase();
      const name = String(file.file_name || '').toLowerCase();
      return type === 'application/pdf' || name.endsWith('.pdf');
    });
    if (!pdf?.storage_key) return new NextResponse('No PDF book is available', { status: 404 });

    const signedUrl = await getBookFileUrl(String(pdf.storage_key), 300);
    const range = request.headers.get('range');
    const upstream = await fetch(signedUrl, {
      headers: range ? { Range: range } : undefined,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse('Unable to load book', { status: upstream.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'inline');
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
