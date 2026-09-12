import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { author_id, user_id } = await request.json()
            // Input validation
            if (!user_id || !author_id) {
                return NextResponse.json(
                    { error: 'Some Form fields are missing' },
                    { status: 400 }
                )
            }

            //delete author
            // Check for books associated with this author
            const { data: books, error: booksError } = await supabase
                .from('books')
                .select('*')
                .eq('author_id', author_id)
                .eq('is_deleted', false);

            if (booksError) {
                console.error('Error checking books:', booksError);
                return;
            }

            if (books.length > 0) {
                return NextResponse.json(
                    { error: 'Please delete the books associated with this author.' },
                    { status: 500 }
                )
            } else {
                // No books found, proceed with deletion
                const { error: authorsDeletionError } = await supabase
                    .from('authors')
                    .update({ is_deleted: true })
                    .eq('author_id', author_id);

                if (authorsDeletionError) {
                    console.error('Error deleting author:', authorsDeletionError)
                    return NextResponse.json(
                        { error: 'Failed to delete author suthor' },
                        { status: 500 }
                    )
                }

                // Start a transaction to update user and delete approval request
                const { data: updateResult, error: deleteClaimError } = await supabase
                    .rpc('delete_claim', {
                        uid: user_id,
                        claim: 'isAuthor'
                    })

                if (deleteClaimError) {
                    console.error('Error deleting user claim:', deleteClaimError)
                    return NextResponse.json(
                        { error: 'Failed to delete user claim' },
                        { status: 500 }
                    )
                }

                return NextResponse.json(
                    { message: 'Author deleted successfully' },
                    { status: 200 }
                )
            }
        } else {
            return NextResponse.json(
                { error: 'Not allowed' },
                { status: 403 }
            )
        }
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}