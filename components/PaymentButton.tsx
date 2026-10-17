'use client';
import { useState, useEffect } from 'react';
import { Loader2Icon, Share2, Mail, MessageCircle, Copy, MoreHorizontal, CreditCard, Building2, ShieldCheck, Wallet } from 'lucide-react';
import { setPurchaseStatus } from '@/utils/purchaseStatusCache';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
const BookFlipbook = dynamic(() => import('@/components/BookFlipbook'), {
    ssr: false,
    loading: () => <div className="h-10 w-full" aria-hidden="true" />,
});

interface PaymentButtonProps { amount: number; notes?: object; userId?: string; isAdmin?: boolean; productId: string; productTitle?: string; }
export default function PaymentButton({ amount, notes, userId, isAdmin = false, productId, productTitle }: PaymentButtonProps) {
    const { toast } = useToast(); const [isLoading, setIsLoading] = useState(false); const [localAmount, setLocalAmount] = useState(amount);
    const [localCurrency, setLocalCurrency] = useState<string | null>(null); const [hasPurchased, setHasPurchased] = useState(false);
    const [isCurrencyFetching, setIsCurrencyFetching] = useState(true); const [isPurchaseChecking, setIsPurchaseChecking] = useState(true); const [isLoginNeededDialogOpen, setIsLoginNeededDialogOpen] = useState(false); const [isPayPalDialogOpen, setIsPayPalDialogOpen] = useState(false); const [selectedInternationalMethod, setSelectedInternationalMethod] = useState<"paypal" | null>(null); const [shareCopied, setShareCopied] = useState(false); const [shareMenuOpen, setShareMenuOpen] = useState(false); const [showMoreShareOptions, setShowMoreShareOptions] = useState(false);
    useEffect(() => {
        let active = true;
        setIsCurrencyFetching(true);

        async function setupLocalCurrency() {
            try {
                // India keeps the existing ₹ pricing and Razorpay checkout.
                // International customers use the agreed flat US$3 PayPal price.
                let isIndia = false;

                if (userId) {
                    const response = await fetch('/api/auth/me', {
                        credentials: 'same-origin',
                        cache: 'no-store',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const country = String(data?.user?.country || '').trim().toUpperCase();
                        isIndia = country === 'IN' || country === 'INDIA';
                    }
                }

                if (!active) return;
                if (isIndia) {
                    setLocalCurrency('INR');
                    setLocalAmount(amount);
                } else {
                    setLocalCurrency('USD');
                    setLocalAmount(3);
                }
            } catch (error) {
                if (!active) return;
                console.error('Error setting up local currency:', error);
                setLocalCurrency('USD');
                setLocalAmount(3);
            } finally {
                if (active) setIsCurrencyFetching(false);
            }
        }

        setupLocalCurrency();
        return () => { active = false; };
    }, [amount, userId]);

    useEffect(() => {
        if (!productId) return;
        let active = true;
        if (isAdmin) {
            setHasPurchased(true);
            setIsPurchaseChecking(false);
            return () => { active = false; };
        }
        setHasPurchased(false);
        setIsPurchaseChecking(true);

        fetch('/api/check-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            cache: 'no-store',
            body: JSON.stringify({ productId }),
        })
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!active) return;
                if (res.ok) {
                    setHasPurchased(Boolean(data.hasPurchased));
                } else {
                    setHasPurchased(false);
                    if (res.status !== 401) console.error('Purchase check failed:', data?.error || res.statusText);
                }
            })
            .catch(error => {
                if (active) {
                    console.error('Error checking purchase:', error);
                    setHasPurchased(false);
                }
            })
            .finally(() => {
                if (active) setIsPurchaseChecking(false);
            });

        return () => { active = false; };
    }, [productId, isAdmin, userId]);

    const getShareDetails = () => {
        const url = `${window.location.origin}/book/${encodeURIComponent(productId)}`;
        const title = productTitle || 'Shoppers Ocean';
        const message = productTitle ? `Check out "${productTitle}" on Shoppers Ocean.` : 'Check out this book on Shoppers Ocean.';
        return { url, title, message, text: `${message} ${url}` };
    };
    const handleShareBook = () => {
        setShowMoreShareOptions(false);
        setShareMenuOpen(true);
    };
    const shareViaWhatsApp = () => {
        const { text } = getShareDetails();
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        setShareMenuOpen(false);
    };
    const shareViaEmail = () => {
        const { title, text } = getShareDetails();
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
        setShareMenuOpen(false);
    };
    const copyBookLink = async () => {
        const { url } = getShareDetails();
        try {
            await navigator.clipboard.writeText(url);
            setShareCopied(true);
            window.setTimeout(() => setShareCopied(false), 2200);
            setShareMenuOpen(false);
        } catch {
            window.prompt('Copy this book link to share:', url);
        }
    };
    const shareToOtherChatApps = async () => {
        const { title, text, url } = getShareDetails();
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url });
                setShareMenuOpen(false);
            } catch (error: any) {
                if (error?.name !== 'AbortError') window.location.href = `sms:?body=${encodeURIComponent(text)}`;
            }
        } else {
            window.location.href = `sms:?body=${encodeURIComponent(text)}`;
        }
    };
    const showMoreOptions = async () => {
        setShowMoreShareOptions(true);
        const { title, text, url } = getShareDetails();
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url });
                setShareMenuOpen(false);
                setShowMoreShareOptions(false);
            } catch (error: any) {
                if (error?.name === 'AbortError') return;
            }
        }
    };
    const shareMenuPanel = shareMenuOpen ? (<div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label="Share this book"><div className="w-full max-w-md rounded-2xl bg-white p-4 text-slate-900 shadow-2xl sm:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">Share this book</h2><button type="button" onClick={() => { setShareMenuOpen(false); setShowMoreShareOptions(false); }} aria-label="Close sharing options" className="rounded-full p-2 hover:bg-slate-100"><X size={20} /></button></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={shareViaWhatsApp} className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700"><MessageCircle size={22} /></span>WhatsApp</button><button type="button" onClick={shareViaEmail} className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Mail size={22} /></span>Email</button><button type="button" onClick={copyBookLink} className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-800"><Copy size={22} /></span>{shareCopied ? 'Link copied!' : 'Copy Link'}</button><button type="button" onClick={shareToOtherChatApps} className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700"><MessageCircle size={22} /></span>Chat apps</button></div><button type="button" onClick={showMoreOptions} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"><MoreHorizontal size={20} />More sharing options</button>{showMoreShareOptions && <p className="mt-2 text-center text-xs text-slate-500">Choose an app from your phone's sharing menu. Available apps depend on your device.</p>}</div></div>) : null;
    const initializeRazorpay = () => new Promise((resolve) => { const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]'); if (existingScript && (window as any).Razorpay) return resolve(true); const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });
    const handlePayment = async () => {
        setIsLoading(true);
        try {
            if (!(await initializeRazorpay())) { alert('Razorpay SDk failed to load'); return; }
            const response = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, currency: localCurrency, notes: { ...notes, original_currency: localCurrency } }) });
            const orderData = await response.json();
            if (!response.ok || !orderData?.orderId) {
                throw new Error(orderData?.error || 'Unable to create payment order');
            }
            const { orderId, amount: orderAmount, currency: orderCurrency } = orderData;
            setLocalAmount(Number(orderAmount));
            setLocalCurrency(String(orderCurrency));
            const options = { key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: Math.round(Number(orderAmount) * 100), currency: String(orderCurrency), name: 'Shoppers Ocean', description: `Payment of ${orderAmount} ${orderCurrency}`, order_id: orderId,
                handler: async (paymentResponse: any) => { try { const verificationResponse = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({razorpay_order_id: paymentResponse.razorpay_order_id, razorpay_payment_id: paymentResponse.razorpay_payment_id, razorpay_signature: paymentResponse.razorpay_signature, original_currency: String(orderCurrency), original_amount: Number(orderAmount), user_id: userId ?? '', product_id: productId, quantity: 1 }) }); const data = await verificationResponse.json(); if (data.error) alert(`Payment failed: ${data.errorDetails || data.error}`); else if (data.status === 'completed') { alert('Payment successful!'); setPurchaseStatus(userId ?? '', productId, true); setHasPurchased(true); } else if (data.status === 'authorized') alert('Payment authorized, awaiting capture'); else if (data.status === 'pending') alert('Payment is pending'); else alert(`Payment status: ${data.status}`); } catch (error) { console.error('Error:', error); alert('Payment verification failed'); } }, notes: { skip_contact_form: 1 }, theme: { color: '#F37254' } };
            new (window as any).Razorpay(options).open();
        } catch (error) { console.error('Error:', error); toast({ variant: "destructive", title: "Payment Error", description: "Unable to process payment. Please try again." }); } finally { setIsLoading(false); }
    };
    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-IN';
    const formattedAmount = localCurrency ? new Intl.NumberFormat(userLocale, { style: 'currency', currency: localCurrency }).format(localAmount) : null;
    const isInitialFetching = isCurrencyFetching || isPurchaseChecking;
    if (hasPurchased) return <div className="w-full mt-6"><BookFlipbook bookId={productId} title={productTitle || 'Book'} onShareBook={handleShareBook} />{shareMenuPanel}</div>;
    const handleBuyClick = () => {
        if (!userId) {
            setIsLoginNeededDialogOpen(true);
            return;
        }
        if (isInitialFetching) return;
        if (localCurrency === 'INR') {
            void handlePayment();
        } else {
            setSelectedInternationalMethod(null);
            setIsPayPalDialogOpen(true);
        }
    };
    return <><div className="flex w-full items-stretch gap-2">
        <button type="button" onClick={handleBuyClick} disabled={isLoading || isInitialFetching} className="inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center rounded-lg bg-blue-600 px-2 py-2 text-center text-[11px] font-extrabold leading-tight text-[#F8FAFC] shadow-md ring-1 ring-blue-700/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 sm:text-sm">{isLoading ? 'Processing...' : isInitialFetching ? <span className='inline-flex items-center justify-center'><Loader2Icon width={16} className='mr-1 animate-spin shrink-0' /><span>Fetching</span></span> : `Buy eBook ${formattedAmount ?? '-'}`}</button>
        <button type="button" onClick={handleShareBook} aria-label="Share book link" className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-2 text-center text-xs font-extrabold leading-tight text-[#F8FAFC] shadow-md ring-1 ring-blue-700/20 transition-all hover:bg-blue-700 active:scale-95 sm:text-sm"><Share2 size={16} aria-hidden="true" className="shrink-0" /><span>{shareCopied ? 'Link copied!' : 'Share Book'}</span></button>
    </div>{shareMenuPanel}<AlertDialog open={isPayPalDialogOpen} onOpenChange={(open) => { setIsPayPalDialogOpen(open); if (!open) setSelectedInternationalMethod(null); }}><AlertDialogContent className="max-h-[90dvh] w-[calc(100%-1.25rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-slate-50 p-0 shadow-2xl sm:w-full"><div className="rounded-t-2xl bg-blue-700 px-5 pb-5 pt-6 text-white sm:px-6"><div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100"><ShieldCheck size={16} /> Secure checkout</div><AlertDialogTitle className="text-center text-xl font-extrabold sm:text-2xl">{selectedInternationalMethod ? "Pay with PayPal" : "Choose a payment method"}</AlertDialogTitle><p className="mt-2 text-center text-sm text-blue-100">Shoppers Ocean international payments</p><div className="mt-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center"><p className="text-xs text-blue-100">Total to pay</p><p className="text-2xl font-extrabold">{formattedAmount ?? '$3.00'}</p><p className="mt-1 truncate text-xs text-blue-100">{productTitle || 'Your eBook purchase'}</p></div></div><div className="space-y-3 p-4 sm:p-5">{!selectedInternationalMethod ? <><p className="px-1 text-sm font-bold text-slate-700">Select how you want to pay</p><button type="button" onClick={() => setSelectedInternationalMethod("paypal")} className="flex min-h-[76px] w-full items-center gap-3 rounded-xl border-2 border-blue-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Wallet size={23} /></span><span className="min-w-0 flex-1"><span className="block font-extrabold text-slate-900">PayPal</span><span className="mt-1 block text-xs text-slate-500">Pay securely using your PayPal account</span></span><span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">Available</span></button><div className="flex min-h-[76px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left opacity-75"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><CreditCard size={23} /></span><span className="min-w-0 flex-1"><span className="block font-bold text-slate-800">Credit or debit card</span><span className="mt-1 block text-xs text-slate-500">International card processing is being set up</span></span><span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Coming soon</span></div><div className="flex min-h-[76px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left opacity-75"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Building2 size={23} /></span><span className="min-w-0 flex-1"><span className="block font-bold text-slate-800">Bank payment</span><span className="mt-1 block text-xs text-slate-500">Will appear when a supported gateway is active</span></span><span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Coming soon</span></div><p className="px-1 pt-1 text-center text-xs leading-relaxed text-slate-500">Only payment methods marked “Available” can be selected. More options will be enabled after their gateways are approved and tested.</p></> : <><Button type="button" variant="ghost" className="mb-1 px-1 text-blue-700 hover:bg-blue-50" onClick={() => setSelectedInternationalMethod(null)}>← All payment options</Button><PayPalCheckoutButton productId={productId} onSuccess={() => {
        alert('Payment successful!');
        setPurchaseStatus(userId ?? '', productId, true);
        setHasPurchased(true);
        setIsPayPalDialogOpen(false);
        setSelectedInternationalMethod(null);
    }} /></>}<div className="flex justify-center pt-1"><Button type="button" variant="outline" className="w-full rounded-lg border-slate-300 bg-white" onClick={() => { setIsPayPalDialogOpen(false); setSelectedInternationalMethod(null); }}>Cancel</Button></div></div></AlertDialogContent></AlertDialog><AlertDialog open={isLoginNeededDialogOpen} onOpenChange={setIsLoginNeededDialogOpen}><AlertDialogContent className='bg-white'><AlertDialogTitle className='hidden'></AlertDialogTitle><Card className="w-full max-w-md border-0"><CardHeader className="relative"><CardTitle className="text-rxl font-bold text-center">Login Required</CardTitle><Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setIsLoginNeededDialogOpen(false)} aria-label="Close popup"><X className="h-4 w-4" /></Button></CardHeader><CardContent><p className="text-center text-muted-foreground">You need to be logged in to make a purchase. Please sign up or sign in to continue.</p></CardContent><CardFooter className="flex justify-center space-x-4"><Link href="/login?type=signup" className="inline-block px-2 py-2 rounded-md text-blue-600 border-blue-600 hover:bg-gray-200">Sign Up</Link><Link href="/login" className="inline-block px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</Link></CardFooter></Card></AlertDialogContent></AlertDialog></>;
}
