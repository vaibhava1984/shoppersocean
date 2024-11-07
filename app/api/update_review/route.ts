import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { currentReview } = await request.json()

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

            const { error: reviewUpdateError } = await supabase
                .from('testimonials')
                .update(currentReview)
                .eq('id', currentReview.id);

            if (reviewUpdateError) {
                console.error('Error updating review:', reviewUpdateError)
                return NextResponse.json(
                    { error: 'Failed to update review details' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'review details updated successfully' },
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