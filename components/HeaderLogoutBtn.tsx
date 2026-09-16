"use client"
import { createClient } from "@/utils/supabase/client";

export default function HeaderLogoutBtn() {
    return (
        <button className="" onClick={async () => {
            const supabase = createClient();
            const signoutStatus = await supabase.auth.signOut();
            if (signoutStatus.error === null) {
                window.location.href = "/";
            }
        }}>
            Logout
        </button>
    )
}