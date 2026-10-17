"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW`.split(" ");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = countryCodes.map((code) => ({ code, name: countryNames.of(code) ?? code }));

export default function Settings({ initialUser }: { initialUser: any }) {
  const [country, setCountry] = useState(initialUser?.user_metadata?.country ?? "");
  const [fullName, setFullName] = useState(initialUser?.user_metadata?.full_name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function markEditing(setter: (value: string) => void, value: string) {
    setter(value);
    setSaved(false);
    setMessage("");
  }

  async function save() {
    setMessage("");
    if (!fullName.trim() || !country || !email.trim()) {
      setMessage("Name, Country and Email are required.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage("Password must contain at least 6 letters/digits.");
      return;
    }
    if (newPassword && newPassword !== confirm) {
      setMessage("The new password and confirmation password do not match.");
      return;
    }

    setSaving(true);
    try {
      const profileResponse = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, country, email }),
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        setMessage(profileData.error || "Unable to update your details.");
        return;
      }

      let emailConfirmed = false;
      try {
        const emailResponse = await fetch("/api/account-updated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName.trim(), email: email.trim() }),
        });
        emailConfirmed = emailResponse.ok;
      } catch {
        emailConfirmed = false;
      }

      let passwordMessage = "";
      if (newPassword) {
        const passwordResponse = await fetch("/api/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        });
        const passwordData = await passwordResponse.json();
        if (!passwordResponse.ok) {
          setSaved(true);
          setMessage((emailConfirmed
            ? "Your details have been successfully updated and a confirmation email has been sent."
            : "Your details were updated, but the confirmation email could not be sent.") +
            " " + (passwordData.error || "The password could not be changed."));
          return;
        }
        setNewPassword("");
        setConfirm("");
        passwordMessage = " Your password has also been changed successfully.";
      }

      setSaved(true);
      setMessage(emailConfirmed
        ? `Hi ${fullName.trim()}! Your details have been successfully updated. A confirmation email has been sent.${passwordMessage}`
        : `Your details were updated, but the confirmation email could not be sent.${passwordMessage}`);
    } catch {
      setMessage("Unable to update your details right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Back to home">
        <span aria-hidden="true" className="text-xl leading-none">←</span><span>Back to Home</span>
      </Link>
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div><label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label><Input value={fullName} onChange={(e) => markEditing(setFullName, e.target.value)} /></div>
            <div><label className="block font-medium mb-1">Country <span className="text-red-500">*</span></label><Select value={country} onValueChange={(value) => markEditing(setCountry, value)}><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent>{countries.map((x) => <SelectItem key={x.code} value={x.code}>{x.name}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label><Input type="email" value={email} onChange={(e) => markEditing(setEmail, e.target.value)} /></div>
            <div><label className="block font-medium mb-1">Change Password <span className="text-slate-500 font-normal">(Optional)</span></label><div className="space-y-3"><Input type="password" value={newPassword} onChange={(e) => markEditing(setNewPassword, e.target.value)} placeholder="New Password" autoComplete="new-password" /><Input type="password" value={confirm} onChange={(e) => markEditing(setConfirm, e.target.value)} placeholder="Confirm New Password" autoComplete="new-password" /><p className="text-sm text-slate-500">Leave both password fields blank to keep your current password. Minimum 6 letters/digits.</p></div></div>
            {message && <div className="rounded-md bg-slate-100 p-3 text-sm" role="status">{message}</div>}
            {!saved && <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6">{saving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{saving ? "Updating..." : "Update"}</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
