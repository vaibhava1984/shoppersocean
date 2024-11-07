import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { author_id } = await request.json()
            // Input validation
            if (!author_id) {
                return NextResponse.json(
                    { error: 'Author ID is required' },
                    { status: 400 }
                )
            }

            // Get Authors table from auth.users table
            const { data: UserDetails, error: UserDetailsError } = await supabase.auth.admin.getUserById(author_id)

            if (UserDetailsError || !UserDetails?.user) {
                console.error('Error getting user details:', UserDetailsError)
                return NextResponse.json(
                    { error: 'Failed to get user datas' },
                    { status: 500 }
                )
            }

            // Start a transaction to update user and delete approval request
            const { data: updateResult, error: updateError } = await supabase
                .rpc('set_claim', {
                    uid: author_id,
                    claim: 'isAuthor',
                    value: true
                })

            if (updateError) {
                console.error('Error updating user:', updateError)
                return NextResponse.json(
                    { error: 'Failed to update user status' },
                    { status: 500 }
                )
            }

            const { data: authorsInsertStatus, error: authorsInsertError } = await supabase
                .from('authors')
                .insert([{
                    name: "-",
                    bio: "-",
                    user_id: author_id
                }])
                .single();

            if (authorsInsertError) {
                console.error('Error inserting author after approval request:', authorsInsertError)
                return NextResponse.json(
                    { error: 'Failed to insert author after approval request' },
                    { status: 500 }
                )
            }

            // Delete the approval request
            const { error: deleteError } = await supabase
                .from('authors_interest_submission')
                .delete()
                .eq('user_id', author_id)

            if (deleteError) {
                console.error('Error deleting approval request:', deleteError)
                return NextResponse.json(
                    { error: 'Failed to delete approval request' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'Author approved successfully' },
                { status: 200 }
            )
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