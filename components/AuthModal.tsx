"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/client-auth";
import { COUNTRIES } from "@/utils/countries";

type AuthModalProps = {
  open: boolean;
  initialMode: "signin" | "signup";
  onClose: () => void;
};

export default function AuthModal({ open, initialMode, onClose }: AuthModalProps) {
  const router = useRouter();
  const auth = useMemo(() => createClient(), []);
  const [isSignIn, setIsSignIn] = useState(initialMode === "signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  isSubmittingRef.current = isSubmitting;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsSignIn(initialMode === "signin");
    setErrors({});
    setNotice("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingRef.current) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, initialMode, onClose]);

  if (!open) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address";
    if (!password) next.password = isSignIn ? "Write your password" : "Password is required";
    else if (password.length < 6) next.password = "Password must be at least 6 letters/digits";
    if (!isSignIn) {
      if (!fullName.trim()) next.fullName = "Full name is required";
      if (!country) next.country = "Country is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const switchMode = (signIn: boolean) => {
    setIsSignIn(signIn);
    setErrors({});
    setNotice("");
    setFullName("");
    setEmail("");
    setPassword("");
    setCountry("");
    setCountryQuery("");
    setCountryOpen(false);
    setShowPassword(false);
  };

  const submit = async () => {
    if (isSubmitting || !validate()) return;
    setIsSubmitting(true);
    setErrors({});
    setNotice("");
    try {
      if (isSignIn) {
        const { error } = await auth.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          const message =
            error.code === "email_not_confirmed"
              ? "Please confirm your email address and try again."
              : error.code === "account_not_found" || error.code === "invalid_credentials"
                ? "Oh dear! Either the password or the email address is incorrect. Sorry, try again 😑"
                : error.message || "An error occurred during sign in. Please try again.";
          setErrors({ general: message });
          return;
        }
        onClose();
        router.refresh();
      } else {
        const { data, error } = await auth.auth.signUp({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          country,
        });
        if (error) {
          setErrors({
            general: error.message?.toLowerCase().includes("already")
              ? "An account with this email already exists. Please sign in or use a different email address."
              : error.message || "An error occurred during sign up. Please try again.",
          });
          return;
        }
        if (!data?.user) {
          setErrors({ general: "Unable to create your account. Please try again." });
          return;
        }
        setNotice("Your account has been created successfully! Please check your email if confirmation is required.");
        setIsSignIn(true);
        setPassword("");
      }
    } catch (error: any) {
      setErrors({ general: error?.message || "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCountries = COUNTRIES.filter((item) =>
    !countryQuery.trim() || item.name.toLowerCase().startsWith(countryQuery.trim().toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center overflow-y-auto bg-slate-950/25 px-3 py-4 backdrop-blur-[2px] sm:px-6 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative my-auto w-full max-w-[440px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:max-h-[min(88dvh,760px)]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close account window"
          className="absolute right-3 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
          <div className="mb-5 pr-8">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Shoppers Ocean</p>
            <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-slate-900">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isSignIn ? "Sign in to continue your reading journey." : "Join us and discover stories from around the world."}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => switchMode(true)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isSignIn ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Sign In</button>
            <button type="button" onClick={() => switchMode(false)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${!isSignIn ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Create Account</button>
          </div>

          {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{notice}</div>}
          {errors.general && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{errors.general}</div>}

          <div className="space-y-3.5">
            {!isSignIn && (
              <>
                <div>
                  <label htmlFor="auth-full-name" className="mb-1 block text-sm font-medium text-slate-700">Full name <span className="text-red-500">*</span></label>
                  <input id="auth-full-name" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setErrors((prev) => ({ ...prev, fullName: "", general: "" })); }} placeholder="Your full name" className={`w-full rounded-lg border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors.fullName ? "border-red-400" : "border-slate-200"}`} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div className="relative">
                  <label htmlFor="auth-country" className="mb-1 block text-sm font-medium text-slate-700">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      id="auth-country"
                      autoComplete="off"
                      value={countryQuery}
                      onFocus={() => setCountryOpen(true)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCountryQuery(value);
                        const selected = COUNTRIES.find((item) => item.name.toLowerCase() === value.trim().toLowerCase());
                        setCountry(selected?.code || "");
                        setCountryOpen(true);
                        setErrors((prev) => ({ ...prev, country: "", general: "" }));
                      }}
                      placeholder="Type to find your country"
                      className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors.country ? "border-red-400" : "border-slate-200"}`}
                    />
                    <button type="button" aria-label="Show country list" onClick={() => setCountryOpen((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"><ChevronDown className="h-4 w-4" /></button>
                    {countryOpen && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                        {filteredCountries.length ? filteredCountries.map((item) => (
                          <button key={item.code} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setCountry(item.code); setCountryQuery(item.name); setCountryOpen(false); setErrors((prev) => ({ ...prev, country: "" })); }} className="block w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-blue-50">{item.name}</button>
                        )) : <p className="px-3.5 py-2 text-sm text-slate-500">No matching country</p>}
                      </div>
                    )}
                  </div>
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
              <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((prev) => ({ ...prev, email: "", general: "" })); }} placeholder="you@example.com" className={`w-full rounded-lg border px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors.email ? "border-red-400" : "border-slate-200"}`} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-slate-700">{isSignIn ? "Password" : "Choose a password (minimum 6 characters)"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={isSignIn ? "current-password" : "new-password"} value={password} onChange={(event) => { setPassword(event.target.value); setErrors((prev) => ({ ...prev, password: "", general: "" })); }} placeholder={isSignIn ? "Enter your password" : "Minimum 6 characters"} className={`w-full rounded-lg border px-3.5 py-2.5 pr-11 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors.password ? "border-red-400" : "border-slate-200"}`} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button type="button" onClick={submit} disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? (isSignIn ? "Signing in..." : "Creating account...") : (isSignIn ? "Sign In" : "Create Account")}
            </button>
          </div>

          <div className="mt-4 text-center">
            {isSignIn && <p className="mb-2 text-sm"><Link href="/forgot-password" onClick={onClose} className="font-medium text-blue-600 hover:text-blue-800">Forgot your password?</Link></p>}
            <p className="text-xs text-slate-500">{isSignIn ? "New to Shoppers Ocean? Use Create Account above." : "Already have an account? Use Sign In above."}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
