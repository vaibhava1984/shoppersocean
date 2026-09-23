import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    // Use the same purchase verification as the existing PDF download flow.
    // The existing flow checks for the user's latest order for this book;
    // it does not require a particular order-status value.
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
