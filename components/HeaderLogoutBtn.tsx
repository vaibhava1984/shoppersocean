"use client"
import { createClient } from "@/utils/supabase/client";

export default function HeaderLogoutBtn() {
    const supabase = createClient();
    return (
        <button className="" onClick={async () => {
            const signoutStatus = await supabase.auth.signOut();
            if (signoutStatus.error === null) {
                window.location.href = "/";
            }
        }}>
            Logout
        </button>
    )
}