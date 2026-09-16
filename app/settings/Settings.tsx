"use client"

import React, { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon } from "lucide-react";

const countryCodes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CR HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL JM JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MZ MM NA NR NP NL NZ NI NE NG NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SZ SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW`.split(' ');

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = countryCodes.map((code) => ({ code, name: countryNames.of(code) ?? code }));

const Settings = () => {
  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCountry(user.user_metadata?.country ?? '');
      setFullName(user.user_metadata?.full_name ?? '');
      setEmail(user.email ?? '');
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleSaveChanges = async () => {
    if (!fullName.trim() || !email.trim()) { window.alert('Please enter your name and email address.'); return; }
    if (newPassword && newPassword.length < 6) { window.alert('Your new password must be at least 6 characters long.'); return; }
    setIsSaving(true);
    const supabase = createClient();
    const updatePayload: Parameters<typeof supabase.auth.updateUser>[0] = { data: { country, full_name: fullName.trim() } };
    if (email.trim()) updatePayload.email = email.trim();
    if (newPassword) updatePayload.password = newPassword;
    const { error } = await supabase.auth.updateUser(updatePayload);
    if (error) { console.error('Error updating user data:', error); setIsSaving(false); window.alert(error.message || 'Unable to update your details. Please try again.'); return; }
    const emailResponse = await fetch('/api/account-updated', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fullName.trim(), email: email.trim() }) });
    setNewPassword(''); setIsSaving(false);
    if (!emailResponse.ok) console.error('Account was updated, but the confirmation email could not be sent.');
    window.alert('Your details have been successfully uploaded');
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card><CardHeader><CardTitle>Account Details</CardTitle></CardHeader><CardContent>
        {loading ? <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-32" /></div> :
        <div className="space-y-5">
          <div><label htmlFor="fullName" className="block font-medium mb-1">Name</label><Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" /></div>
          <div><label htmlFor="country" className="block font-medium mb-1">Country</label><Select value={country} onValueChange={setCountry}><SelectTrigger id="country" className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent>{countries.map((item) => <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select></div>
          <div><label htmlFor="email" className="block font-medium mb-1">Email</label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" autoComplete="email" /></div>
          <div><label htmlFor="newPassword" className="block font-medium mb-1">Update password</label><Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter a new password" autoComplete="new-password" /><p className="text-xs text-slate-500 mt-1">Leave blank if you do not want to change your password.</p></div>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6">{isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}{isSaving ? 'Updating...' : 'Update'}</Button>
        </div>}
      </CardContent></Card>
    </div>
  );
};

export default Settings;
