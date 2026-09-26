import { NextResponse } from 'next/server'
import { createClient } from '@/utils/db/server'
import { createAdminClient } from '@/utils/db/server'

export async function POST(request: Request) {
    try {
        const authClient = createClient();
        const {
            data: { user },
        } = await authClient.auth.getUser();

        if (!user || user?.app_metadata?.userrole !== "ADMIN") {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json(
                { error: 'Review ID is required.' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        const { error: testimonialsDeletionError } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (testimonialsDeletionError) {
            console.error('Error deleting review:', testimonialsDeletionError);
            return NextResponse.json(
                { error: 'Failed to delete review.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Review deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
