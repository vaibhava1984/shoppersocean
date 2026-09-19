import { NextResponse } from "next/server"
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
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    const body = await request.json()
    const fullName = String(body.fullName ?? "").trim()
    const country = String(body.country ?? "")
    const email = String(body.email ?? "").trim()
    const address = String(body.address ?? "").trim()
    const mobile = String(body.mobile ?? "").trim()

    if (!fullName || !country || !email) {
      return NextResponse.json({ error: "Name, Country and Email are required." }, { status: 400 })
    }

    let phone: string | undefined
    if (mobile) {
      if (country !== "IN") {
        return NextResponse.json({ error: "Mobile verification is currently available for Indian mobile numbers only." }, { status: 400 })
      }
      phone = normalizeIndianMobile(mobile)
      if (!phone) {
        return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number starting with 6–9." }, { status: 400 })
      }
    }

    const admin = createAdminClient()
    const update: {
      email: string
      phone?: string
      user_metadata: Record<string, string>
    } = {
      email,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        country,
        full_name: fullName,
        address,
        mobile: phone ?? "",
      },
    }

    if (phone) update.phone = phone

    const { data, error } = await admin.auth.admin.updateUserById(user.id, update)

    if (error) {
      console.error("Profile update failed:", error)
      return NextResponse.json({ error: error.message || "Unable to update your details." }, { status: 422 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      mobile: phone ?? "",
    })
  } catch (error) {
    console.error("Profile update request failed:", error)
    return NextResponse.json({ error: "Unable to update your details right now." }, { status: 500 })
  }
}
