import { NextResponse } from 'next/server';
import { getLegacyProfileForClerkUser } from '@/utils/auth/clerkProfile';
import { getD1 } from '@/utils/cloudflare/d1';
import { getBooksBucket } from '@/utils/cloudflare/r2';

export async function GET(request: Request) {
  try {
    const identity = await getLegacyProfileForClerkUser();
    if (!identity) return new NextResponse('Not authorized', { status: 403 });
    const db = getD1();
    const bucket = getBooksBucket();
    if (!db || !bucket) throw new Error('Cloudflare storage is not available');

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    if (!bookId) return new NextResponse('Book ID is required', { status: 400 });

    const purchase = await db.prepare(
      "SELECT id FROM orders WHERE user_id = ? AND product_id = ? AND status = 'completed' LIMIT 1"
    ).bind(identity.profile.id, bookId).first();
    if (!purchase) return new NextResponse('Purchase required', { status: 403 });

    const files = await db.prepare(
      "SELECT file_path, file_name, file_type FROM private_book_files WHERE book_id = ? ORDER BY created_at DESC LIMIT 20"
    ).bind(bookId).all<Record<string, any>>();
    const pdf = files.results.find((file) => {
      const type = String(file.file_type || '').toLowerCase();
      const name = String(file.file_name || '').toLowerCase();
      return type === 'pdf' || name.endsWith('.pdf');
    });
    if (!pdf?.file_path) return new NextResponse('No PDF book is available', { status: 404 });

    const rangeHeader = request.headers.get('range');
    let range: { offset: number; length?: number } | undefined;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : undefined;
        range = { offset: start, ...(end !== undefined ? { length: end - start + 1 } : {}) };
      }
    }

    const object = await bucket.get(String(pdf.file_path), range ? { range } : undefined);
    if (!object?.body) return new NextResponse('Book file not found', { status: 404 });

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Cache-Control', 'private, no-store');
    headers.set('Accept-Ranges', 'bytes');
    if (object.size != null) headers.set('Content-Length', String(object.size));
    if (object.etag || object.httpEtag) headers.set('ETag', String(object.etag || object.httpEtag));

    let status = 200;
    if (range && object.range) {
      status = 206;
      const start = object.range.offset;
      const end = start + object.range.length - 1;
      headers.set('Content-Range', `bytes ${start}-${end}/${object.size ?? '*'}`);
    }
    return new NextResponse(object.body, { status, headers });
  } catch (error) {
    console.error('Error serving purchased book PDF:', error);
    return new NextResponse('Failed to load book', { status: 500 });
  }
}
