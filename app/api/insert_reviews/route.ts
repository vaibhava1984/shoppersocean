import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { description, rating, users } = await request.json()
            // Input validation
            if (!description || !rating || !users) {
                return NextResponse.json(
                    { error: 'Some Form fields are missing' },
                    { status: 400 }
                )
            }

            // // Start a transaction to update user and delete approval request
            // const { data: updateResult, error: updateError } = await supabase
            //     .rpc('set_claim', {
            //         uid: user_id,
            //         claim: 'isAuthor',
            //         value: true
            //     })

            // if (updateError) {
            //     console.error('Error updating user:', updateError)
            //     return NextResponse.json(
            //         { error: 'Failed to update user status' },
            //         { status: 500 }
            //     )
            // }

            const { data: reviewInsertStatus, error: reviewInsertError } = await supabase
                .from('testimonials')
                .insert([{
                    description: description,
                    rating: rating,
                    users: users
                }])
                .single();

            if (reviewInsertError) {
                console.error('Error inserting review:', reviewInsertError)
                return NextResponse.json(
                    { error: 'Failed to insert review details' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'review added successfully' },
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