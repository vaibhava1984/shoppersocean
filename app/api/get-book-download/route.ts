import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id; // Get authenticated user ID
        console.log("userId 1=>", userId)
        if (!userId) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            )
        }
        const { bookId, fileName } = await request.json()
        // Check if user has purchased the book
        const { data: purchase, error: purchaseError } = await supabase
            .from('orders')
            .select()
            .eq('user_id', userId)
            .eq('product_id', bookId)
            .single();

        console.log("purchase 1=>", purchase)

        if (purchaseError || !purchase) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            )
        }

        // Get Book download path
        const { data: privateBookPaths, error: privateBookPathsError } = await supabase
            .from('private_book_files')
            .select()
            .eq('book_id', bookId);

        console.log("privateBookPaths===>", privateBookPaths)

        if (privateBookPaths?.length === 0) {
            return NextResponse.json(
                { error: 'Files not found' },
                { status: 500 }
            )
        }

        // Generate signed URL
        const folderPaths = privateBookPaths?.map(p => p.file_path)
        const { data: signedUrls, error: signedUrlError } = await supabase
            .storage
            .from('books-content')
            .createSignedUrls(folderPaths, 300); // 5 minutes expiry

        if (signedUrlError) {
            throw signedUrlError;
        }

        console.log("signedUrls===>", signedUrls)

        const signedUrlsFinal = signedUrls?.map(d => {
            const findFromPrivatePaths = privateBookPaths?.filter(p => p.file_path === d.path)
            if (findFromPrivatePaths?.length) {
                return {
                    downloadUrl: d.signedUrl,
                    fileType: findFromPrivatePaths?.[0]?.file_type,
                    fileName: findFromPrivatePaths?.[0]?.file_name,
                }
            }
        })

        return NextResponse.json(
            { urls: signedUrlsFinal },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error generating download URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate download URL' },
            { status: 500 }
        )
    }
}