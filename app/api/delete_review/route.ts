import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { id } = await request.json()
            // Input validation
            if (!id) {
                return NextResponse.json(
                    { error: 'Some Form fields are missing' },
                    { status: 400 }
                )
            }

            const { error: testimonialsDeletionError } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (testimonialsDeletionError) {
                console.error('Error deleting review:', testimonialsDeletionError)
                return NextResponse.json(
                    { error: 'Failed to delete review' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { message: 'Review deleted successfully' },
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