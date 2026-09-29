'use client';
import { useState, useEffect } from 'react';
import { Loader2Icon, X } from 'lucide-react';
import { fetchExchangeRates, convertCurrency } from '@/utils/currency';
import { getPurchaseStatus, setPurchaseStatus } from '@/utils/purchaseStatusCache';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { exchangeRatesCache } from '@/utils/cache';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const BookFlipbook = dynamic(() => import('@/components/BookFlipbook'), {
    ssr: false,
    loading: () => <div className="h-10 w-full" aria-hidden="true" />,
});

interface PaymentButtonProps {
    amount: number;
    notes?: object;
    userId?: string;
    productId: string;
    productTitle?: string;
}

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

export default function PaymentButton({ amount, notes, userId, productId, productTitle }: PaymentButtonProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [localAmount, setLocalAmount] = useState(amount);
    const [localCurrency, setLocalCurrency] = useState<string>('INR');
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isInitialFetching, setIsInitialFetching] = useState(!!userId);
    const [isLoginNeededDialogOpen, setIsLoginNeededDialogOpen] = useState(false);

    useEffect(() => {
        let active = true;
        async function setupLocalCurrency() {
            try {
                setIsInitialFetching(true);
                const rates = await getExchangeRatesOnce();
                if (!active) return;
                setLocalCurrency('INR');
                setLocalAmount(rates.INR ? convertCurrency(amount, 'INR', 'INR', rates) : amount);
            } catch (error) {
                if (!active) return;
                console.error('Error setting up local currency:', error);
                setLocalCurrency('INR');
                setLocalAmount(amount);
            } finally {
                if (active) setIsInitialFetching(false);
            }
        }
        setupLocalCurrency();
        return () => { active = false; };
    }, [amount]);

    useEffect(() => {
        if (!productId || !userId) return;
        let active = true;
        setIsInitialFetching(true);
        getPurchaseStatus(userId, productId)
            .then(purchased => { if (active) setHasPurchased(purchased); })
            .catch(error => console.error('Error checking purchase:', error))
            .finally(() => { if (active) setIsInitialFetching(false); });
        return () => { active = false; };
    }, [productId, userId]);

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
            if (!userId) {
                setIsLoginNeededDialogOpen(true);
                return;
            }

            if (!(await initializeRazorpay())) {
                throw new Error('Razorpay checkout failed to load');
            }

            const keyResponse = await fetch('/api/razorpay-key', { cache: 'no-store' });
            const keyData = await keyResponse.json();
            if (!keyResponse.ok || !keyData.keyId) {
                throw new Error(keyData.error || 'Razorpay public key is unavailable');
            }

            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: localAmount,
                    currency: localCurrency,
                    notes: { ...notes, original_currency: localCurrency, product_id: productId, user_id: userId },
                }),
            });

            const orderData = await response.json();
            if (!response.ok || !orderData.orderId) {
                throw new Error(orderData.error || 'Unable to create payment order');
            }

            const options = {
                key: keyData.keyId,
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
                                user_id: userId,
                                product_id: productId,
                                quantity: 1,
                            }),
                        });
                        const data = await verificationResponse.json();
                        if (!verificationResponse.ok || data.error) {
                            alert(`Payment failed: ${data.errorDetails || data.error}`);
                        } else if (data.status === 'completed') {
                            alert('Payment successful!');
                            setPurchaseStatus(userId, productId, true);
                            setHasPurchased(true);
                        } else if (data.status === 'authorized') {
                            alert('Payment authorized, awaiting capture');
                        } else if (data.status === 'pending') {
                            alert('Payment is pending');
                        } else {
                            alert(`Payment status: ${data.status}`);
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed');
                    }
                },
                notes: { skip_contact_form: 1 },
                theme: { color: '#F37254' },
            };

            new (window as any).Razorpay(options).open();
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: error instanceof Error ? error.message : 'Unable to process payment. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const formattedAmount = new Intl.NumberFormat(userLocale, { style: 'currency', currency: localCurrency }).format(localAmount);

    if (hasPurchased) {
        return <div className="w-full mt-6"><BookFlipbook bookId={productId} title={productTitle || 'Book'} /></div>;
    }

    return <>
        <button
            onClick={userId ? handlePayment : () => setIsLoginNeededDialogOpen(true)}
            disabled={isLoading || isInitialFetching}
            className="px-4 py-2 bg-blue-500 text-white rounded h-[40px] hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400"
        >
            {isLoading ? 'Processing...' : isInitialFetching ? <span className="inline-flex"><Loader2Icon width={16} className="animate-spin mr-1" /><span>Fetching</span></span> : `Buy ebook ${formattedAmount}`}
        </button>

        <AlertDialog open={isLoginNeededDialogOpen} onOpenChange={setIsLoginNeededDialogOpen}>
            <AlertDialogContent className="bg-white">
                <AlertDialogTitle className="hidden"></AlertDialogTitle>
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
    </>;
}
