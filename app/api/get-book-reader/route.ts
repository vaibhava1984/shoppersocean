import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getUserByClerkId } from '@/cloudflare/db/users';
import { hasPurchasedBook } from '@/cloudflare/db/purchases';

const clerkEnabled = () =>
  process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === 'true' &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    if (clerkEnabled()) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

      const { env } = getCloudflareContext();
      const user = await getUserByClerkId(env, userId);
      if (!user) return NextResponse.json({ error: 'Account migration is not complete' }, { status: 503 });

      if (!(await hasPurchasedBook(env, user.id, bookId))) {
        return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
      }

      const file = await env.DB.prepare(
        `SELECT file_name, file_type, r2_key
         FROM private_book_files
         WHERE book_id = ?1 AND r2_key IS NOT NULL
         ORDER BY CASE WHEN lower(file_type) = 'pdf' THEN 0 ELSE 1 END, file_name
         LIMIT 1`
      ).bind(bookId).first<{ file_name: string; file_type: string | null; r2_key: string }>();

      if (!file) return NextResponse.json({ error: 'Book file is not migrated to R2' }, { status: 404 });

      return NextResponse.json({
        readerUrl: `/api/get-book-reader-pdf?bookId=${encodeURIComponent(bookId)}`,
        fileName: file.file_name,
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { data: purchase, error: purchaseError } = await supabase
      .from('orders')
      .select()
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .order('order_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchaseError || !purchase) return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
    const { data: files, error: filesError } = await supabase.from('private_book_files').select('file_path, file_name, file_type').eq('book_id', bookId);
    if (filesError) throw filesError;
    const pdf = files?.find((file) => String(file.file_type || '').toLowerCase() === 'pdf' || String(file.file_name || '').toLowerCase().endsWith('.pdf'));
    if (!pdf) return NextResponse.json({ error: 'No PDF book is available' }, { status: 404 });
    return NextResponse.json({ readerUrl: `/api/get-book-reader-pdf?bookId=${encodeURIComponent(bookId)}`, fileName: pdf.file_name });
  } catch (error) {
    console.error('Error creating protected reader URL:', error);
    return NextResponse.json({ error: 'Failed to open book' }, { status: 500 });
  }
}
