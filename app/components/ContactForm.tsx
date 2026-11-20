"use client"
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const deleteDialogCss = `
.sod-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;
  padding:20px;background:rgba(9,12,20,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  animation:sod-fade .18s ease-out both;overflow-y:auto;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
@keyframes sod-fade{from{opacity:0}to{opacity:1}}
@keyframes sod-rise{from{opacity:0;transform:translateY(14px) scale(.975)}to{opacity:1;transform:none}}
.sod-card{position:relative;width:100%;max-width:520px;background:#fff;border-radius:18px;
  box-shadow:0 24px 70px -12px rgba(8,12,24,.45),0 0 0 1px rgba(15,23,42,.06);
  animation:sod-rise .22s cubic-bezier(.2,.8,.3,1) both;overflow:hidden}
.sod-stripe{height:5px;background:linear-gradient(90deg,#f97316,#ef4444 55%,#b91c1c)}
.sod-body{padding:26px 26px 22px}
.sod-head{display:flex;gap:14px;align-items:flex-start}
.sod-icon{flex:0 0 auto;width:46px;height:46px;border-radius:13px;display:grid;place-items:center;
  background:#fef2f2;color:#dc2626;box-shadow:inset 0 0 0 1px #fee2e2}
.sod-title{margin:0;font-size:19px;line-height:1.3;font-weight:700;color:#0f172a;letter-spacing:-.01em}
.sod-sub{margin:6px 0 0;font-size:13.5px;line-height:1.55;color:#64748b}
.sod-list{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:9px}
.sod-item{display:flex;gap:11px;align-items:flex-start;padding:11px 13px;border-radius:11px;
  background:#f8fafc;border:1px solid #eef2f7}
.sod-item--warn{background:#fff7ed;border-color:#ffedd5}
.sod-dot{flex:0 0 auto;width:7px;height:7px;border-radius:50%;margin-top:6px;background:#ef4444}
.sod-item--warn .sod-dot{background:#f97316}
.sod-itemtext{font-size:13.5px;line-height:1.5;color:#334155}
.sod-itemtext b{color:#0f172a;font-weight:650}
.sod-note{margin:16px 0 0;font-size:12.5px;line-height:1.55;color:#64748b}
.sod-note b{color:#0f172a;font-weight:650}
.sod-error{margin:14px 0 0;padding:10px 12px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;
  color:#b91c1c;font-size:13px;line-height:1.45}
.sod-actions{display:flex;gap:10px;margin-top:22px}
.sod-btn{flex:1;appearance:none;border:0;border-radius:11px;padding:12px 16px;font-size:14px;font-weight:650;
  font-family:inherit;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease,background .12s ease}
.sod-btn:active{transform:translateY(1px)}
.sod-btn:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
.sod-btn[disabled]{cursor:not-allowed;opacity:.62}
.sod-cancel{background:#f1f5f9;color:#0f172a;box-shadow:inset 0 0 0 1px #e2e8f0}
.sod-cancel:hover:not([disabled]){background:#e9eef5}
.sod-delete{background:linear-gradient(180deg,#ef4444,#dc2626);color:#fff;
  box-shadow:0 6px 16px -6px rgba(220,38,38,.65),inset 0 1px 0 rgba(255,255,255,.18)}
.sod-delete:hover:not([disabled]){background:linear-gradient(180deg,#e33b3b,#c81e1e)}
.sod-spin{display:inline-block;width:14px;height:14px;margin-right:8px;vertical-align:-2px;
  border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;animation:sod-spin .7s linear infinite}
@keyframes sod-spin{to{transform:rotate(360deg)}}
.sod-success{text-align:center;padding:34px 26px 30px}
.sod-check{width:54px;height:54px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;
  background:#ecfdf5;color:#059669;box-shadow:inset 0 0 0 1px #d1fae5}
@media (max-width:520px){
  .sod-body{padding:22px 18px 18px}
  .sod-actions{flex-direction:column-reverse}
  .sod-title{font-size:17.5px}
}
@media (prefers-reduced-motion:reduce){
  .sod-overlay,.sod-card,.sod-spin{animation:none!important}
}
`;

const ContactForm = ({
    user,
    title = 'Have a Question?',
    description = "We're here to help! Reach out to us with any queries or suggestions.",
    successMessage = 'Thank you for your message!',
    hideDescription = false,
}: {
    title?: string,
    description?: string,
    successMessage?: string,
    hideDescription?: boolean,
    user?: any,
}) => {
    const [showThankYou, setShowThankYou] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteDone, setDeleteDone] = useState(false);

    useEffect(() => {
        if (!showDeleteDialog) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeletingAccount) {
                setShowDeleteDialog(false);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [showDeleteDialog, isDeletingAccount]);

    const openDeleteDialog = () => {
        if (isDeletingAccount) return;
        setDeleteError('');
        setDeleteDone(false);
        setShowDeleteDialog(true);
    };

    const handleDeleteAccount = async () => {
        if (isDeletingAccount) return;
        setIsDeletingAccount(true);
        setDeleteError('');
        try {
            const response = await fetch('/api/delete-account', {
                method: 'POST',
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirm: true }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Unable to delete your account. Please try again.');
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
            setDeleteDone(true);
            window.setTimeout(() => {
                window.location.href = '/';
            }, 2400);
        } catch (err) {
            console.error('Account deletion failed:', err);
            setDeleteError(err instanceof Error ? err.message : 'Unable to delete your account. Please try again.');
            setIsDeletingAccount(false);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email') as string;
        const message = formData.get('message');

        if (!name || !email || !message) {
            setErrorMessage('Please fill out all fields.');
            return;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        setErrorMessage('');

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/contact-me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                }),
            });
            const responseJson = await response.json()

            if (!response.ok) {
                throw new Error(responseJson?.error ?? 'Something went wrong, please try again later.');
            }

            setShowThankYou(true);
        } catch (error: any) {
            setErrorMessage(error?.message || 'An error occurred, please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    {title && (
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
                    )}
                    {!hideDescription && (
                        <p className="text-xl mb-8 text-slate-600">
                            {description}
                        </p>
                    )}

                    {showThankYou ? (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-6">
                                <p className="text-2xl font-semibold text-blue-600">{successMessage}</p>
                                <p className="mt-2 text-slate-600">We'll get back to you shortly.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        name="name"
                                        type="text"
                                        placeholder="Your Name"
                                        required
                                    />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Your Email"
                                        required
                                    />
                                    <Textarea
                                        name="message"
                                        placeholder="Your Message"
                                        required
                                        className="min-h-[100px]"
                                    />

                                    {errorMessage && (
                                        <p className="text-red-600">{errorMessage}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:scale-101 hover:shadow-lg
                    active:scale-95 
                    transition-all duration-200
                    disabled:bg-gray-400"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : <><Mail className="mr-2 h-4 w-4" /> Send Message</>}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                    {user && (
                        <div className="mt-4 flex justify-center">
                            <button type="button" onClick={openDeleteDialog} disabled={isDeletingAccount}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                                {isDeletingAccount ? 'Deleting account...' : 'delete my account'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteDialog && (
                <div
                    className="sod-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isDeletingAccount) {
                            setShowDeleteDialog(false);
                        }
                    }}
                >
                    <style dangerouslySetInnerHTML={{ __html: deleteDialogCss }} />

                    <div
                        className="sod-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="sod-title"
                        aria-describedby="sod-desc"
                    >
                        <div className="sod-stripe" />

                        {deleteDone ? (
                            <div className="sod-success">
                                <div className="sod-check" aria-hidden="true">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </div>
                                <h2 id="sod-title" className="sod-title">Your account has been deleted</h2>
                                <p id="sod-desc" className="sod-sub">
                                    A confirmation email is on its way to your inbox. Taking you back to the home page…
                                </p>
                            </div>
                        ) : (
                            <div className="sod-body">
                                <div className="sod-head">
                                    <div className="sod-icon" aria-hidden="true">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 id="sod-title" className="sod-title">Delete your account?</h2>
                                        <p id="sod-desc" className="sod-sub">
                                            This is permanent. Once your account is gone, the following will be lost and
                                            <b> cannot be restored</b>.
                                        </p>
                                    </div>
                                </div>

                                <ul className="sod-list">
                                    <li className="sod-item sod-item--warn">
                                        <span className="sod-dot" aria-hidden="true" />
                                        <span className="sod-itemtext">
                                            <b>Books you purchased</b> — removed from your library. You will lose
                                            access to download or read them again.
                                        </span>
                                    </li>

                                    <li className="sod-item sod-item--warn">
                                        <span className="sod-dot" aria-hidden="true" />
                                        <span className="sod-itemtext">
                                            <b>Your subscription</b> (if taken) — cancelled immediately. Any
                                            remaining time is forfeited and no refund is issued.
                                        </span>
                                    </li>

                                    <li className="sod-item sod-item--warn">
                                        <span className="sod-dot" aria-hidden="true" />
                                        <span className="sod-itemtext">
                                            <b>Books you published</b> (authors) — unpublished and removed from
                                            the store. Readers will no longer be able to buy them.
                                        </span>
                                    </li>

                                    <li className="sod-item sod-item--warn">
                                        <span className="sod-dot" aria-hidden="true" />
                                        <span className="sod-itemtext">
                                            <b>Revenue you earned</b> (authors) — any unpaid earnings and pending
                                            payouts are forfeited.
                                        </span>
                                    </li>

                                    <li className="sod-item">
                                        <span className="sod-dot" aria-hidden="true" />
                                        <span className="sod-itemtext">
                                            <b>Your profile, reviews and history</b> — permanently erased.
                                        </span>
                                    </li>
                                </ul>

                                <p className="sod-note">
                                    If you only want to stop paying, you can <b>cancel your subscription</b> and
                                    keep your library instead.
                                </p>

                                {deleteError && (
                                    <p className="sod-error" role="alert">{deleteError}</p>
                                )}

                                <div className="sod-actions">
                                    <button
                                        type="button"
                                        className="sod-btn sod-cancel"
                                        onClick={() => setShowDeleteDialog(false)}
                                        disabled={isDeletingAccount}
                                        autoFocus
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="sod-btn sod-delete"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeletingAccount}
                                        aria-busy={isDeletingAccount}
                                    >
                                        {isDeletingAccount && <span className="sod-spin" aria-hidden="true" />}
                                        {isDeletingAccount ? 'Deleting…' : 'Sure, delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ContactForm;