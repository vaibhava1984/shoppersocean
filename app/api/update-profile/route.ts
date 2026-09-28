import { NextResponse } from "next/server"
import { getSessionUser, updateCurrentUser } from "@/utils/auth/server"

const normalizeIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`
  return ""
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })

    const body = await request.json()
    const fullName = String(body.fullName ?? "").trim()
    const country = String(body.country ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const address = String(body.address ?? "").trim()
    const mobile = String(body.mobile ?? "").trim()

    if (!fullName || !country || !email) return NextResponse.json({ error: "Name, Country and Email are required." }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })

    let phone = ""
    if (mobile) {
      if (country !== "IN") return NextResponse.json({ error: "Mobile numbers are currently supported for Indian mobile numbers only." }, { status: 400 })
      phone = normalizeIndianMobile(mobile)
      if (!phone) return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number starting with 6–9." }, { status: 400 })
    }

    const result = await updateCurrentUser({ full_name: fullName, country, email, phone, address })
    if (result.error) return NextResponse.json({ error: result.error.message || "Unable to update your details." }, { status: 422 })
    return NextResponse.json({ success: true, user: result.data.user })
  } catch (error) {
    console.error("Profile update request failed:", error)
    return NextResponse.json({ error: "Unable to update your details right now." }, { status: 500 })
  }
}
