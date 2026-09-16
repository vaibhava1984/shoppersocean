import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/server_admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

    const admin = createAdminClient();
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('id, status, razorpay_order_id')
      .eq('user_id', user.id)
      .eq('product_id', bookId);
    if (ordersError) throw ordersError;

    const paymentLookupIds = Array.from(new Set((orders || []).flatMap((order: any) => [order.id, order.razorpay_order_id]).filter(Boolean).map(String)));
    let payments: any[] = [];
    if (paymentLookupIds.length) {
      const { data, error: paymentsError } = await admin
        .from('payments')
        .select('order_id, status')
        .in('order_id', paymentLookupIds);
      if (paymentsError) throw paymentsError;
      payments = data || [];
    }

    const purchased = (orders || []).some((order: any) => {
      if (String(order?.status || '').toLowerCase() === 'completed') return true;
      const validOrderIds = new Set([String(order?.id || ''), String(order?.razorpay_order_id || '')].filter(Boolean));
      return payments.some((payment: any) => validOrderIds.has(String(payment?.order_id || '')) && String(payment?.status || '').toLowerCase() === 'completed');
    });
    if (!purchased) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

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
