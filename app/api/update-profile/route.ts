import { NextResponse } from "next/server"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { updateUserProfile } from "@/cloudflare/db/users"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/server_admin"

const normalizeIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`
  return ""
}

export async function POST(request: Request) {
  try {
    const clerkEnabled =
      process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
      Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
      Boolean(process.env.CLERK_SECRET_KEY)

    const body = await request.json()
    const fullName = String(body.fullName ?? "").trim()
    const country = String(body.country ?? "")
    const email = String(body.email ?? "").trim()
    const address = String(body.address ?? "").trim()
    const mobile = String(body.mobile ?? "").trim()

    if (!fullName || !country || !email) {
      return NextResponse.json({ error: "Name, Country and Email are required." }, { status: 400 })
    }

    if (clerkEnabled) {
      const { userId } = await auth()
      const clerkUser = await currentUser()
      if (!userId || !clerkUser) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })

      const currentEmail = clerkUser.emailAddresses[0]?.emailAddress ?? ""
      if (email.toLowerCase() !== currentEmail.toLowerCase()) {
        return NextResponse.json({ error: "Email changes will be enabled after the account migration is completed." }, { status: 400 })
      }

      const currentMobile = String(clerkUser.privateMetadata?.originalMobile ?? "")
      const normalizedMobile = mobile ? normalizeIndianMobile(mobile) : ""
      if (mobile && (!normalizedMobile || country !== "IN")) {
        return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number starting with 6–9." }, { status: 400 })
      }
      if (normalizedMobile && normalizedMobile !== currentMobile) {
        return NextResponse.json({ error: "Mobile verification will be enabled after the Clerk account migration is completed." }, { status: 400 })
      }

      const client = await clerkClient()
      const nameParts = fullName.split(/\s+/).filter(Boolean)
      await client.users.updateUser(userId, {
        firstName: nameParts[0] || fullName,
        lastName: nameParts.slice(1).join(" ") || undefined,
      })

      const { env } = getCloudflareContext()
      const existing = await env.DB.prepare("SELECT id FROM users WHERE clerk_user_id = ?1 LIMIT 1").bind(userId).first<{ id: string }>()
      if (!existing) return NextResponse.json({ error: "Your migrated profile is not available yet." }, { status: 503 })

      const updated = await updateUserProfile(env, existing.id, {
        fullName,
        country,
        address,
        mobile: currentMobile,
      })

      return NextResponse.json({
        success: true,
        otpRequired: false,
        mobile: updated.mobile,
        user: updated,
      })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })

    let phone: string | undefined
    if (mobile) {
      if (country !== "IN") return NextResponse.json({ error: "Mobile verification is currently available for Indian mobile numbers only." }, { status: 400 })
      phone = normalizeIndianMobile(mobile)
      if (!phone) return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number starting with 6–9." }, { status: 400 })
    }

    const admin = createAdminClient()
    const update = {
      email,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        country,
        full_name: fullName,
        address,
        mobile: user.phone ?? user.user_metadata?.mobile ?? "",
      },
    }
    const { data, error } = await admin.auth.admin.updateUserById(user.id, update)

    if (!error && phone) {
      const { error: phoneError } = await supabase.auth.updateUser({ phone })
      if (phoneError) return NextResponse.json({ error: phoneError.message || "We could not send the verification code to this mobile number." }, { status: 422 })
    }
    if (error) return NextResponse.json({ error: error.message || "Unable to update your details." }, { status: 422 })

    return NextResponse.json({ success: true, otpRequired: Boolean(phone), user: data.user, mobile: phone ?? "" })
  } catch (error: any) {
    console.error("Profile update request failed:", error)
    return NextResponse.json({ error: error?.message || "Unable to update your details right now." }, { status: 500 })
  }
}
