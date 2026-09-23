"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Loader2Icon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW`.split(" ")
const countryNames = new Intl.DisplayNames(["en"], { type: "region" })
const countries = countryCodes.map(code => ({ code, name: countryNames.of(code) ?? code }))

const normalizeIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`
  return ""
}

export default function ClerkSettings({ initialUser }: { initialUser: any }) {
  const { user, isLoaded } = useUser()
  const [country, setCountry] = useState(initialUser?.user_metadata?.country ?? "")
  const [fullName, setFullName] = useState(initialUser?.user_metadata?.full_name ?? "")
  const [email] = useState(initialUser?.email ?? "")
  const [mobile, setMobile] = useState(initialUser?.user_metadata?.mobile ?? initialUser?.phone ?? "")
  const [originalMobile, setOriginalMobile] = useState(initialUser?.user_metadata?.mobile ?? initialUser?.phone ?? "")
  const [address, setAddress] = useState(initialUser?.user_metadata?.address ?? "")
  const [otp, setOtp] = useState("")
  const [otpRequired, setOtpRequired] = useState(false)
  const [phoneResource, setPhoneResource] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  if (!isLoaded) return <div className="p-6 text-center">Loading settings…</div>
  if (!user) return <div className="p-6 text-center">You must be signed in.</div>

  const saveProfile = async (mobileValue: string) => {
    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, country, email, mobile: mobileValue, address }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Unable to update your details.")
    return result
  }

  const handleSave = async () => {
    setMessage("")
    if (!fullName.trim() || !country || !email.trim()) {
      setMessage("Name, Country and Email are required.")
      return
    }
    const normalized = mobile ? normalizeIndianMobile(mobile) : ""
    if (mobile && (!normalized || country !== "IN")) {
      setMessage("Please enter a valid 10-digit Indian mobile number starting with 6–9.")
      return
    }
    setSaving(true)
    try {
      const oldNormalized = originalMobile ? normalizeIndianMobile(originalMobile) : ""
      if (normalized && normalized !== oldNormalized) {
        await saveProfile(originalMobile)
        const created = await user.createPhoneNumber({ phoneNumber: normalized })
        await created.prepareVerification()
        await user.reload()
        const resource = user.phoneNumbers.find(item => item.id === created.id)
        setPhoneResource(resource)
        setOtpRequired(true)
        setOtp("")
        setMessage("A 6-digit verification code has been sent to your mobile number.")
      } else {
        await saveProfile(normalized)
        setMobile(normalized)
        setOriginalMobile(normalized)
        setMessage("Your details have been successfully updated.")
      }
    } catch (error: any) {
      setMessage(error?.errors?.[0]?.message || error?.message || "Unable to update your details right now.")
    } finally {
      setSaving(false)
    }
  }

  const verifyMobile = async () => {
    if (!/^\d{6}$/.test(otp) || !phoneResource) {
      setMessage("Please enter the 6-digit verification code.")
      return
    }
    setSaving(true)
    try {
      const result = await phoneResource.attemptVerification({ code: otp })
      if (result?.verification?.status !== "verified") throw new Error("The verification code could not be confirmed.")
      await user.reload()
      await saveProfile(normalizeIndianMobile(mobile))
      setOtpRequired(false)
      setOtp("")
      setOriginalMobile(normalizeIndianMobile(mobile))
      setMessage("Mobile number verified successfully.")
    } catch (error: any) {
      setMessage(error?.errors?.[0]?.message || error?.message || "Incorrect or expired verification code.")
    } finally {
      setSaving(false)
    }
  }

  const handlePassword = async () => {
    setPasswordMessage("")
    if (password.length < 6) {
      setPasswordMessage("Password must contain at least 6 letters/digits.")
      return
    }
    if (password !== confirmPassword) {
      setPasswordMessage("The new password and confirmation password do not match.")
      return
    }
    setChangingPassword(true)
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to change your password.")
      setPassword("")
      setConfirmPassword("")
      setPasswordMessage(result.message || "Your password has been changed successfully.")
    } catch (error: any) {
      setPasswordMessage(error?.message || "Unable to change your password right now.")
    } finally {
      setChangingPassword(false)
    }
  }

  return <div className="space-y-6 p-6 max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold">Settings</h1>
    <Card>
      <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
      <CardContent><div className="space-y-5">
        <div><label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
        <div><label className="block font-medium mb-1">Country <span className="text-red-500">*</span></label><Select value={country} onValueChange={setCountry}><SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent>{countries.map(item => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label><Input type="email" value={email} disabled /></div>
        <div><label className="block font-medium mb-1">Mobile <span className="text-slate-500 font-normal">(Optional: if you want to order any products)</span></label><Input type="tel" inputMode="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91XXXXXXXXXX" /></div>
        {otpRequired && <div className="space-y-2"><label className="block font-medium">Mobile verification code</label><div className="flex gap-2"><Input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="6-digit OTP" /><Button type="button" onClick={verifyMobile} disabled={saving || otp.length !== 6} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">Verify</Button></div></div>}
        <div><label className="block font-medium mb-1">Complete Address <span className="text-slate-500 font-normal">(Optional: if you want to order any products)</span></label><textarea className="w-full rounded-md border border-gray-300 px-4 py-2 min-h-24" value={address} onChange={e => setAddress(e.target.value)} /></div>
        {message && <div className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</div>}
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">{saving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{saving ? "Updating..." : "Update"}</Button>
      </div></CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
      <CardContent><div className="space-y-5">
        <div><label className="block font-medium mb-1">New Password</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter a new password" autoComplete="new-password" /><p className="mt-1 text-sm text-slate-500">Minimum 6 letters/digits.</p></div>
        <div><label className="block font-medium mb-1">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" /></div>
        {passwordMessage && <div className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{passwordMessage}</div>}
        <Button type="button" onClick={handlePassword} disabled={changingPassword || password.length < 6 || confirmPassword.length < 6} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">{changingPassword && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{changingPassword ? "Changing Password..." : "Change Password"}</Button>
      </div></CardContent>
    </Card>
  </div>
