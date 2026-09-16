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
      .select('id, status')
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    if (purchaseError || !purchase) return NextResponse.json({ error: 'Purchase required' }, { status: 403 });

    const admin = createAdminClient();
    const { data: files, error: filesError } = await admin
      .from('private_book_files')
      .select('file_path, file_name, file_type')
      .eq('book_id', bookId);
    if (filesError) throw filesError;

    const pdf = files?.find((file) => {
      const type = String(file.file_type || '').toLowerCase();
      const name = String(file.file_name || '').toLowerCase();
      return type === 'pdf' || name.endsWith('.pdf');
    });
    if (!pdf) return NextResponse.json({ error: 'No PDF book is available' }, { status: 404 });

    const { data: signed, error: signedError } = await admin.storage.from('books-content').createSignedUrl(pdf.file_path, 300);
    if (signedError || !signed?.signedUrl) throw signedError || new Error('Unable to create reader URL');

    return NextResponse.json({ readerUrl: signed.signedUrl, fileName: pdf.file_name, expiresIn: 300 });
  } catch (error) {
    console.error('Error creating protected reader URL:', error);
    return NextResponse.json({ error: 'Failed to open book' }, { status: 500 });
  }
}
