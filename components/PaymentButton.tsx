'use client';
import { useState, useEffect } from 'react';
import { FileIcon, Loader2Icon } from 'lucide-react';
import { fetchExchangeRates, convertCurrency, getCurrencyCode } from '@/utils/currency';
import { createClient } from "@/utils/supabase/client";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast"
import { exchangeRatesCache } from "@/utils/cache"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface PaymentButtonProps {
    amount: number;
    notes?: object;
    userId?: string;
    productId: string;
}

export interface ExchangeRates {
    [key: string]: number;
}

type UrlInfo = {
    downloadUrl: string;
    fileName: string;
    fileType: 'jpeg' | 'pdf';
};

// Homepage renders several PaymentButtons at once. Share the initial network
// work so every card does not start its own identical request.
let exchangeRatesPromise: Promise<ExchangeRates> | null = null;
let currentUserPromise: ReturnType<ReturnType<typeof createClient>['auth']['getUser']> | null = null;

function getExchangeRatesOnce(): Promise<ExchangeRates> {
    const cachedRates = exchangeRatesCache.get();
    if (cachedRates) return Promise.resolve(cachedRates);

    if (!exchangeRatesPromise) {
        exchangeRatesPromise = fetchExchangeRates()
            .then(rates => {
                exchangeRatesCache.set(rates);
                return rates;
            })
            .catch(error => {
                exchangeRatesPromise = null;
                throw error;
            });
    }

    return exchangeRatesPromise;
}

export default function PaymentButton({ amount, notes, userId, productId }: PaymentButtonProps) {
    const supabase = createClient();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [localAmount, setLocalAmount] = useState(amount);
    const [localCurrency, setLocalCurrency] = useState<string | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);

    const [isInitialFetching, setIsInitialFetching] = useState(userId ? true : false);

    const [isFetchingDownloadUrls, setIsFetchingDownloadUrls] = useState(false);
    const [downloadUrls, setDownloadUrls] = useState<UrlInfo[]>([]);
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
    const [isLoginNeededDialogOpen, setIsLoginNeededDialogOpen] = useState(false);

    useEffect(() => {
        let active = true;

        const getUserOnce = async () => {
            if (!currentUserPromise) {
                currentUserPromise = supabase.auth.getUser();
            }
            return currentUserPromise;
        };

        const getUserCurrency = (): string => {
            try {
                const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
                return new Intl.NumberFormat(userLocale, {
                    style: 'currency',
                    currency: 'USD'
                }).resolvedOptions().currency || 'INR';
            } catch (error) {
                console.warn('Error detecting user currency:', error);
                return 'INR';
            }
        };

        async function setupLocalCurrency(passedCurrency?: string) {
            try {
                const detectedCurrency = passedCurrency ?? getUserCurrency();
                if (active) setIsInitialFetching(true);

                const rates = await getExchangeRatesOnce();

                if (!active) return;
                if (rates[detectedCurrency]) {
                    setLocalCurrency(detectedCurrency);
                    setLocalAmount(convertCurrency(amount, 'INR', detectedCurrency, rates));
                } else {
                    setLocalCurrency('INR');
                    setLocalAmount(amount);
                }
                setIsInitialFetching(false);
            } catch (error) {
                if (!active) return;
                console.error('Error setting up local currency:', error);
                setLocalCurrency('INR');
                setLocalAmount(amount);
                setIsInitialFetching(false);
            }
        }

        // Anonymous visitors do not need an auth request just to display a
        // price. Logged-in cards share one auth request across the page.
        if (userId) {
            getUserOnce()
                .then(({ data }) => {
                    if (!active) return;
                    const country = data.user?.user_metadata?.country;
                    setupLocalCurrency(country ? getCurrencyCode(country) : undefined);
                })
                .catch(() => setupLocalCurrency());
        } else {
            setupLocalCurrency();
        }

        return () => {
            active = false;
        };
    }, [amount, userId, supabase]);

    useEffect(() => {
        if (productId && productId?.length && userId) {
            checkPurchaseViaAPI(productId)
        }
    }, [productId, userId])

    useEffect(() => {
        if (productId && productId?.length && userId && hasPurchased) {
            handleDownload(productId)
        }
    }, [productId, userId, hasPurchased])

    const checkPurchaseViaAPI = async (productId: string) => {
        try {
            setIsInitialFetching(true);
            const response = await fetch('/api/check-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId })
            });
            const data = await response.json();
            setHasPurchased(data.hasPurchased);
            setIsInitialFetching(false);
        } catch (error) {
            setIsInitialFetching(false);
            console.error('Error:', error);
        }
    };

    const initializeRazorpay = () => {
        return new Promise((resolve) => {
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript && (window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            const res = await initializeRazorpay();

            if (!res) {
                alert('Razorpay SDK failed to load');
                return;
            }

            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: localAmount,
                    currency: localCurrency,
                    notes: {
                        ...notes,
                        original_currency: localCurrency,
                    },
                }),
            });

            const { orderId } = await response.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(localAmount * 100),
                currency: localCurrency,
                name: 'Shoppers Ocean',
                description: `Payment of ${localAmount} ${localCurrency}`,
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        setIsLoading(true)
                        const verificationResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                original_currency: localCurrency,
                                original_amount: localAmount,
                                user_id: userId ?? '',
                                product_id: productId,
                                quantity: 1,
                            }),
                        });

                        const data = await verificationResponse.json();

                        if (data.error) {
                            alert(`Payment failed: ${data.errorDetails || data.error}`);
                        } else {
                            switch (data.status) {
                                case 'completed':
                                    alert('Payment successful!');
                                    setIsLoading(false)
                                    setHasPurchased(true);
                                    handleDownload(productId)
                                    break;
                                case 'authorized':
                                    alert('Payment authorized, awaiting capture');
                                    break;
                                case 'pending':
                                    alert('Payment is pending');
                                    break;
                                default:
                                    alert(`Payment status: ${data.status}`);
                            }
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Payment verification failed');
                    }
                },
                notes: {
                    skip_contact_form: 1
                },
                theme: {
                    color: '#F37254',
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Error:', error);
            toast({
                variant: "destructive",
                title: "Payment Error",
                description: "Unable to process payment. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    async function handleDownload(bookId: string) {
        try {
            setIsFetchingDownloadUrls(true);
            const response = await fetch('/api/get-book-download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookId }),
            });

            const allData = await response.json();
            const { urls, error } = allData

            if (!response.ok) {
                setIsFetchingDownloadUrls(false);
                return;
            }

            setIsFetchingDownloadUrls(false);
            setDownloadUrls(urls);
        } catch (error: any) {
            console.error('Error downloading file:', error);
            setIsFetchingDownloadUrls(false);
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.message ?? "Failed to fetch download links",
            });
        }
    }

    async function downloadFile(downloadData: {
        downloadUrl: string,
        fileName: string,
        fileType: string,
    }) {
        try {
            const { downloadUrl: downlaodUrlMain, fileName } = downloadData;
            if (!downlaodUrlMain || !fileName) return;
            const response = await fetch(downlaodUrlMain);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }

    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const formattedAmount = localCurrency ? new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: localCurrency,
    }).format(localAmount) : null;

    if (hasPurchased) {
        return (
            <>
                <button
                    onClick={() => {
                        if (downloadUrls?.length) downloadFile(downloadUrls[0])
                        else alert("File not found!")
                    }}
                    className="px-4 py-2 flex bg-blue-500 text-white rounded h-[40px] hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400"
                >
                    {isFetchingDownloadUrls && <Loader2Icon width={20} className='animate-spin mr-2' />}
                    <span>{isFetchingDownloadUrls ? 'Processing' : 'Download'}</span>
                </button>
                <AlertDialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Download File</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            <div className="grid grid-cols-2 gap-4">
                                {downloadUrls.map((downloadUrl, downloadUrlIndex) => (
                                    <div key={`${downloadUrlIndex}_download_file`}>
                                        <a href={downloadUrl?.downloadUrl} download={downloadUrl?.fileName} target="_blank" className="flex items-center space-x-2 rounded-sm px-4 py-3 hover:underline text-white bg-blue-400">
                                            <FileIcon width={24} />
                                            <span>{downloadUrl?.fileType?.toUpperCase()} file</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    }

    return (
        <>
            <button
                onClick={userId ? handlePayment : () => setIsLoginNeededDialogOpen(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded h-[40px] hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:bg-gray-400"
            >
                {isLoading ? 'Processing...' : isInitialFetching ? <span className='inline-flex'><Loader2Icon width={16} className='animate-spin mr-1' /><span>Fetching</span></span> : `Buy ebook ${formattedAmount ?? '-'}`}
            </button>
            <AlertDialog open={isLoginNeededDialogOpen} onOpenChange={setIsLoginNeededDialogOpen}>
                <AlertDialogContent className='bg-white'>
                    <AlertDialogTitle className='hidden'></AlertDialogTitle>
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