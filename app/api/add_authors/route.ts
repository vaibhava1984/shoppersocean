import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { name, user_id } = await request.json()
            // Input validation
            if (!name || !user_id) {
                return NextResponse.json(
                    { error: 'Some Form fields are missing' },
                    { status: 400 }
                )
            }

            // Start a transaction to update user and delete approval request
            const { data: updateResult, error: updateError } = await supabase
                .rpc('set_claim', {
                    uid: user_id,
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
                    name: name,
                    // bio: bio,
                    user_id: user_id
                }])
                .single();

            if (authorsInsertError) {
                console.error('Error inserting author request:', authorsInsertError)
                return NextResponse.json(
                    { error: 'Failed to insert author request' },
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