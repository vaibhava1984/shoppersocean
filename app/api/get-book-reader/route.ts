import { NextResponse } from 'next/server';
import { getLegacyProfileForClerkUser } from '@/utils/auth/clerkProfile';
import { getD1 } from '@/utils/cloudflare/d1';

export async function POST(request: Request) {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const db = getD1();
    if (!db) throw new Error('Cloudflare D1 is not available');
    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    const purchase = await db.prepare(
      "SELECT id FROM orders WHERE user_id = ? AND product_id = ? AND status = 'completed' LIMIT 1"
    ).bind(identity.profile.id, bookId).first();
    if (!purchase) return NextResponse.json({ error: 'Purchase required' }, { status: 403 });

    const files = await db.prepare(
      "SELECT file_path, file_name, file_type FROM private_book_files WHERE book_id = ? ORDER BY created_at DESC LIMIT 20"
    ).bind(bookId).all<Record<string, any>>();
    const pdf = files.results.find((file) => {
      const type = String(file.file_type || '').toLowerCase();
      const name = String(file.file_name || '').toLowerCase();
      return type === 'pdf' || name.endsWith('.pdf');
    });
    if (!pdf) return NextResponse.json({ error: 'No PDF book is available' }, { status: 404 });

    return NextResponse.json({
      readerUrl: `/api/get-book-reader-pdf?bookId=${encodeURIComponent(bookId)}`,
      fileName: pdf.file_name
    });
  } catch (error) {
    console.error('Error creating protected reader URL:', error);
    return NextResponse.json({ error: 'Failed to open book' }, { status: 500 });
  }
}
