"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2Icon } from "lucide-react"

const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW`.split(" ")
const countryNames = new Intl.DisplayNames(["en"], { type: "region" })
const countries = countryCodes.map(code => ({ code, name: countryNames.of(code) ?? code }))

const Settings = () => {
  const supabase = createClient()
  const [country, setCountry] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [address, setAddress] = useState("")
  const [otp, setOtp] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneVerificationRequired, setPhoneVerificationRequired] = useState(false)
  const [originalMobile, setOriginalMobile] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setCountry(user.user_metadata?.country ?? "")
      setFullName(user.user_metadata?.full_name ?? "")
      setEmail(user.email ?? "")
      setMobile(user.phone ?? "")
      setOriginalMobile(user.phone ?? "")
      setAddress(user.user_metadata?.address ?? "")
      setPhoneVerified(!!user.phone_confirmed_at)
      setLoading(false)
    }
    fetchUserData()
  }, [])

  const handleSaveChanges = async () => {
    setMessage("")
    if (!fullName.trim() || !country || !email.trim()) {
      setMessage("Name, Country and Email are required.")
      return
    }

    setIsSaving(true)
    const updatePayload: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        country,
        full_name: fullName.trim(),
        address: address.trim(),
      },
      email: email.trim(),
    }

    const mobileChanged = mobile.trim() !== originalMobile
    if (mobileChanged && mobile.trim()) updatePayload.phone = mobile.trim()

    const { data, error } = await supabase.auth.updateUser(updatePayload)

    if (error) {
      setIsSaving(false)
      setMessage(error.message || "Unable to update your details.")
      return
    }

    setIsSaving(false)

    if (mobileChanged && mobile.trim()) {
      setPhoneVerificationRequired(true)
      setPhoneVerified(false)
      setOtp("")
      setMessage("A 6-digit verification code has been sent to your mobile number. Please verify it below.")
    } else {
      setMessage("Your details have been successfully updated.")
    }

    setOriginalMobile(data.user?.phone ?? mobile.trim())
  }

  const verifyPhone = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter the 6-digit verification code.")
      return
    }
    setIsSaving(true)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobile.trim(),
      token: otp,
      type: "phone_change",
    })
    setIsSaving(false)

    if (error) {
      setMessage(error.message || "Incorrect or expired verification code.")
      return
    }

    setPhoneVerified(!!data.user?.phone_confirmed_at || true)
    setPhoneVerificationRequired(false)
    setOriginalMobile(mobile.trim())
    setOtp("")
    setMessage("Mobile number verified successfully.")
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : (
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your name" />
              </div>

              <div>
                <label htmlFor="country" className="block font-medium mb-1">Country <span className="text-red-500">*</span></label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{countries.map(item => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="email" className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" autoComplete="email" />
              </div>

              <div>
                <label htmlFor="mobile" className="block font-medium mb-1">Mobile <span className="text-slate-500 font-normal">(Optional: if you want to order any products)</span></label>
                <div className="flex gap-2">
                  <Input id="mobile" type="tel" inputMode="tel" value={mobile} onChange={e => { setMobile(e.target.value); setPhoneVerified(false); setPhoneVerificationRequired(false) }} placeholder="+91XXXXXXXXXX" />
                  {phoneVerified && <span className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white whitespace-nowrap">Verified ✓</span>}
                </div>
                {phoneVerificationRequired && !phoneVerified && (
                  <div className="mt-2 flex gap-2">
                    <Input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="6-digit code" />
                    <Button type="button" onClick={verifyPhone} disabled={isSaving} className="bg-blue-600 text-white">Verify</Button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block font-medium mb-1">Complete Address <span className="text-slate-500 font-normal">(Optional: if you want to order any products)</span></label>
                <textarea id="address" className="w-full rounded-md border border-gray-300 px-4 py-2 min-h-24" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your complete address" />
              </div>

              {message && <div className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</div>}

              <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6">
                {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Updating..." : "Update"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings
