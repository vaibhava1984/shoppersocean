'use client';
import { useState, useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';
import { fetchExchangeRates, convertCurrency, getCurrencyCode } from '@/utils/currency';
import { createClient } from "@/utils/supabase/client";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { exchangeRatesCache } from "@/utils/cache";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PaymentButtonProps { amount: number; notes?: object; userId?: string; productId: string; }
export interface ExchangeRates { [key: string]: number; }

let exchangeRatesPromise: Promise<ExchangeRates> | null = null;

function getExchangeRatesOnce(): Promise<ExchangeRates> {
    const cachedRates = exchangeRatesCache.get();
    if (cachedRates) return Promise.resolve(cachedRates);
    if (!exchangeRatesPromise) {
        exchangeRatesPromise = fetchExchangeRates()
            .then(rates => { exchangeRatesCache.set(rates); return rates; })
            .catch(error => { exchangeRatesPromise = null; throw error; });
    }
    return exchangeRatesPromise;
}

export default function PaymentButton({ amount, notes, userId, productId }: PaymentButtonProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [localAmount, setLocalAmount] = useState(amount);
    const [localCurrency, setLocalCurrency] = useState<string | null>(null);
    const [isInitialFetching, setIsInitialFetching] = useState(Boolean(userId));
    const [isLoginNeededDialogOpen, setIsLoginNeededDialogOpen] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let active = true;
        const getUserCurrency = (): string => {
            try {
                const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
                return new Intl.NumberFormat(userLocale, { style: 'currency', currency: 'USD' }).resolvedOptions().currency || 'INR';
            } catch { return 'INR'; }
        };
        async function setupLocalCurrency(passedCurrency?: string) {
            try {
                const detectedCurrency = passedCurrency ?? getUserCurrency();
                const rates = await getExchangeRatesOnce();
                if (!active) return;
                if (rates[detectedCurrency]) {
                    setLocalCurrency(detectedCurrency);
                    setLocalAmount(convertCurrency(amount, 'INR', detectedCurrency, rates));
                } else {
                    setLocalCurrency('INR');
                    setLocalAmount(amount);
                }
            } catch (error) {
                if (!active) return;
                console.error('Error setting up local currency:', error);
                setLocalCurrency('INR');
                setLocalAmount(amount);
            } finally {
                if (active) setIsInitialFetching(false);
            }
        }
        if (userId) {
            supabase.auth.getUser()
                .then(({ data }) => {
                    const country = data.user?.user_metadata?.country;
                    return setupLocalCurrency(country ? getCurrencyCode(country) : undefined);
                })
                .catch(() => setupLocalCurrency());
        } else {
            setupLocalCurrency();
        }
        return () => { active = false; };
    }, [amount, userId]);

    const initializeRazorpay = () => new Promise<boolean>((resolve) => {
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript && (window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            if (!(await initializeRazorpay())) {
                alert('Razorpay SDK failed to load');
                return;
            }
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: localAmount, currency: localCurrency, notes: { ...notes, original_currency: localCurrency } })
            });
            const orderData = await response.json();
            if (!response.ok || !orderData.orderId) throw new Error(orderData.error || 'Unable to create order');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(localAmount * 100),
                currency: localCurrency,
                name: 'Shoppers Ocean',
                description: `Payment of ${localAmount} ${localCurrency}`,
                order_id: orderData.orderId,
                handler: async (paymentResponse: any) => {
                    try {
                        const verificationResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                original_currency: localCurrency,
                                original_amount: localAmount,
                                user_id: userId ?? '',
                                product_id: productId,
                                quantity: 1
                            })
                        });
                        const data = await verificationResponse.json();
                        if (data.error) {
                            alert(`Payment failed: ${data.errorDetails || data.error}`);
                        } else if (data.status === 'completed') {
                            alert('Payment successful!');
                            window.dispatchEvent(new CustomEvent('book-purchase-completed', { detail: { productId } }));
                        } else if (data.status === 'authorized') {
                            alert('Payment authorized, awaiting capture');
                        } else if (data.status === 'pending') {
                            alert('Payment is pending');
                        } else {
                            alert(`Payment status: ${data.status}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Payment verification failed');
                    }
                },
                notes: { skip_contact_form: 1 },
                theme: { color: '#F37254' }
            };
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Error:', error);
            toast({ variant: "destructive", title: "Payment Error", description: "Unable to process payment. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const formattedAmount = localCurrency
        ? new Intl.NumberFormat(userLocale, { style: 'currency', currency: localCurrency }).format(localAmount)
        : null;

    return (
        <>
            <button
                onClick={userId ? handlePayment : () => setIsLoginNeededDialogOpen(true)}
                disabled={isLoading || isInitialFetching}
                className="px-4 py-2 bg-blue-500 text-white rounded h-[40px] hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400"
            >
                {isLoading ? 'Processing...' : isInitialFetching ? <span className='inline-flex'><Loader2Icon width={16} className='animate-spin mr-1' /><span>Fetching</span></span> : `Buy ebook ${formattedAmount ?? '-'}`}
            </button>

            <AlertDialog open={isLoginNeededDialogOpen} onOpenChange={setIsLoginNeededDialogOpen}>
                <AlertDialogContent className='bg-white'>
                    <AlertDialogTitle className='hidden'>Login Required</AlertDialogTitle>
                    <Card className="w-full max-w-md border-0">
                        <CardHeader className="relative">
                            <CardTitle className="text-2xl font-bold text-center">Login Required</CardTitle>
                            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setIsLoginNeededDialogOpen(false)} aria-label="Close popup"><X className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent><p className="text-center text-muted-foreground">You need to be logged in to make a purchase. Please sign up or sign in to continue.</p></CardContent>
                        <CardFooter className="flex justify-center space-x-4">
                            <Link href="/login?type=signup" className="inline-block px-2 py-2 rounded-md text-blue-600 border-blue-600 hover:bg-gray-200">Sign Up</Link>
                            <Link href="/login" className="inline-block px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</Link>
                        </CardFooter>
                    </Card>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
