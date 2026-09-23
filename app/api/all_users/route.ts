import { createAdminClient } from "@/utils/supabase/server_admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // Authenticate the actual signed-in admin using the request cookies.
        // The service-role client must only be used after this check; it does not
        // carry the browser user's session by itself.
        const authClient = await createClient();
        const {
            data: { user },
        } = await authClient.auth.getUser();

        if (user?.app_metadata?.userrole === "ADMIN") {
            const adminClient = createAdminClient();
            const { data: { users }, error: usersFetchError } = await adminClient.auth.admin.listUsers({
                page: 1,
                perPage: 1000
            })


            if (usersFetchError) {
                console.error('Error fetching users records:', usersFetchError);
                return;
            }

            // Return a clean, explicit user list so email addresses are always
            // available to the admin UI even if the Auth user object changes shape.
            const safeUsers = users.map((authUser) => ({
                id: authUser.id,
                email: authUser.email ?? authUser.user_metadata?.email ?? '',
                phone: authUser.phone,
                created_at: authUser.created_at,
                updated_at: authUser.updated_at,
                app_metadata: authUser.app_metadata,
                user_metadata: authUser.user_metadata,
                confirmed_at: authUser.confirmed_at,
                last_sign_in_at: authUser.last_sign_in_at,
            }))

            return NextResponse.json(
                { users: safeUsers },
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