import { NextResponse } from 'next/server';
import { createClient } from '@/utils/db/server';

export async function POST(request: Request) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    const { data: purchase, error: purchaseError } = await db
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchaseError || !purchase) return NextResponse.json({ error: 'Purchase required' }, { status: 403 });

    const { data: files, error: filesError } = await db
      .from('private_book_files')
      .select('storage_key, file_name, mime_type')
      .eq('book_id', bookId);
    if (filesError) throw filesError;

    const pdf = (files || []).find((file: any) =>
      String(file.mime_type || '').toLowerCase() === 'application/pdf' ||
      String(file.file_name || '').toLowerCase().endsWith('.pdf')
    );
    if (!pdf) return NextResponse.json({ error: 'No PDF book is available' }, { status: 404 });

    return NextResponse.json({
      readerUrl: '/api/get-book-reader-pdf?bookId=' + encodeURIComponent(bookId),
      fileName: pdf.file_name
    });
  } catch (error) {
    console.error('Error creating protected reader URL:', error);
    return NextResponse.json({ error: 'Failed to open book' }, { status: 500 });
  }
}
