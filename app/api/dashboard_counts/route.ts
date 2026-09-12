import { createAdminClient } from "@/utils/supabase/server_admin";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user?.app_metadata?.userrole === "ADMIN") {
            const { count: booksCount, error: booksError } = await supabase
                .from('books')
                .select('*', { count: 'exact' })
                .eq('is_deleted', false);
            const { count: authorsCount, error: authorsError } = await supabase
                .from('authors')
                .select('*', { count: 'exact' })
                .eq('is_deleted', false);
            const { count: profilesCount, error: profilesError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' });


            if (booksError) {
                console.error('Error fetching books records count:', booksError);
                return;
            }

            return NextResponse.json(
                { booksCount, authorsCount, profilesCount },
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