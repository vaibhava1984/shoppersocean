"use client"

import React, { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"

const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW`.split(" ")
const countryNames = new Intl.DisplayNames(["en"], { type: "region" })
const countries = countryCodes.map(code => ({ code, name: countryNames.of(code) ?? code }))

const normalizeIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, "")
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) return `+${digits}`
  return ""
}

const Settings = ({ initialUser }: { initialUser: any }) => {
  const supabase = createClient()
  const initialMobile = initialUser?.phone ?? ""
  const [country, setCountry] = useState(initialUser?.user_metadata?.country ?? "")
  const [fullName, setFullName] = useState(initialUser?.user_metadata?.full_name ?? "")
  const [email, setEmail] = useState(initialUser?.email ?? "")
  const [mobile, setMobile] = useState(initialMobile)
  const [address, setAddress] = useState(initialUser?.user_metadata?.address ?? "")
  const [originalMobile, setOriginalMobile] = useState(initialMobile)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [otp, setOtp] = useState("")
  const [otpRequired, setOtpRequired] = useState(false)

  const handleSaveChanges = async () => {
    setMessage("")

    if (!fullName.trim() || !country || !email.trim()) {
      setMessage("Name, Country and Email are required.")
      return
    }

    const enteredMobile = mobile.trim()
    if (enteredMobile && country !== "IN") {
      setMessage("Mobile numbers are currently supported for Indian mobile numbers only.")
      return
    }

    if (enteredMobile && !normalizeIndianMobile(enteredMobile)) {
      setMessage("Please enter a valid 10-digit Indian mobile number starting with 6–9.")
      return
    }

    setIsSaving(true)

    const normalizedMobile = enteredMobile ? normalizeIndianMobile(enteredMobile) : ""
    const mobileChanged = normalizedMobile !== normalizeIndianMobile(originalMobile)

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, country, email, mobile: enteredMobile, address }),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || "Unable to update your details.")
        return
      }

      setMobile(normalizedMobile)
      if (mobileChanged && normalizedMobile) {
        setOtpRequired(true)
        setOtp("")
        setMessage("A 6-digit verification code has been sent to your mobile number. Please enter it below.")
      } else {
        setOriginalMobile(normalizedMobile)
        setMessage("Your details have been successfully updated.")
      }
      await supabase.auth.refreshSession()
    } catch {
      setMessage("Unable to update your details right now. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage("")

    if (newPassword.length < 6) {
      setPasswordMessage("Password must contain at least 6 letters/digits.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new password and confirmation password do not match.")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordMessage(result.error || "Unable to change your password.")
        return
      }

      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage(result.message || "Your password has been changed successfully.")
    } catch {
      setPasswordMessage("Unable to change your password right now. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent>
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
              <Input id="mobile" type="tel" inputMode="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91XXXXXXXXXX" />
            </div>

            {otpRequired && (
              <div className="space-y-2">
                <label htmlFor="phoneOtp" className="block font-medium mb-1">Mobile verification code</label>
                <div className="flex gap-2">
                  <Input id="phoneOtp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="6-digit OTP" />
                  <Button type="button" onClick={async () => {
                    if (!/^\d{6}$/.test(otp)) { setMessage("Please enter the 6-digit verification code."); return }
                    setIsSaving(true)
                    const { error } = await supabase.auth.verifyOtp({ phone: normalizeIndianMobile(mobile), token: otp, type: "phone_change" })
                    setIsSaving(false)
                    if (error) { setMessage(error.message || "Incorrect or expired verification code."); return }
                    setOtpRequired(false)
                    setOtp("")
                    setOriginalMobile(normalizeIndianMobile(mobile))
                    setMessage("Mobile number verified successfully.")
                  }} disabled={isSaving || otp.length !== 6} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold whitespace-nowrap">Verify</Button>
                </div>
              </div>
            )}

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block font-medium mb-1">New Password</label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                autoComplete="new-password"
              />
              <p className="mt-1 text-sm text-slate-500">Minimum 6 letters/digits.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-medium mb-1">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter the new password"
                autoComplete="new-password"
              />
            </div>

            {passwordMessage && <div className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{passwordMessage}</div>}

            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword || newPassword.length < 6 || confirmPassword.length < 6}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
            >
              {isChangingPassword && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings
