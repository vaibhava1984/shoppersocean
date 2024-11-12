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
    amount: number; // Amount in INR from your database
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
    fileType: 'jpeg' | 'pdf';  // You can add more file types if needed
};


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
        // Detect user's locale and currency
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

        // Fetch exchange rates and convert amount
        async function setupLocalCurrency(passedCurrency?: string) {
            try {
                const detectedCurrency = passedCurrency ?? getUserCurrency();
                const cachedRates = exchangeRatesCache.get();
                setIsInitialFetching(true);

                let rates: ExchangeRates;
                if (cachedRates) {
                    rates = cachedRates;
                    console.log('Using cached exchange rates');
                } else {
                    rates = await fetchExchangeRates();
                    exchangeRatesCache.set(rates);
                    console.log('Fetched new exchange rates');
                }

                if (rates[detectedCurrency]) {
                    setLocalCurrency(detectedCurrency);
                    // setLocalCurrency('BRL');
                    const convertedAmount = convertCurrency(amount, 'INR', detectedCurrency, rates);
                    setLocalAmount(convertedAmount);
                }
                setIsInitialFetching(false)
            } catch (error) {
                console.error('Error setting up local currency:', error);
                setLocalCurrency('INR');
                setLocalAmount(amount);
            }
        }

        supabase.auth.getUser().then(({ data }) => {
            const { user } = data;
            // console.log("wow===>", user)
            if (user && user?.user_metadata?.country) {
                // console.log("using country from DB")
                const currencyCode = getCurrencyCode(user?.user_metadata?.country);
                // console.log("using country from DB currencyCode=>", currencyCode)
                setupLocalCurrency(currencyCode)
            } else {
                setupLocalCurrency();
            }
        })
    }, [amount]);

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
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
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

            // Create order
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

            const { orderId, amountInINR } = await response.json();

            // Configure payment options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(localAmount * 100), // Use local amount directly
                currency: localCurrency, // Use local currency
                name: 'Shoppers Ocean',
                description: `Payment of ${localAmount} ${localCurrency}`,
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        setIsLoading(true)
                        // console.log("response=>", response)
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
                                // shipping_address: {
                                //     street: '123 Main St',
                                //     city: 'Mumbai',
                                //     state: 'Maharashtra',
                                //     postal_code: '400001',
                                //     country: 'India'
                                // },
                                // contact_number: '+919876543210',
                                // email: 'customer@example.com'
                            }),
                        });

                        const data = await verificationResponse.json();

                        if (data.error) {
                            // Handle payment failure
                            alert(`Payment failed: ${data.errorDetails || data.error}`);
                            // You might want to redirect to a failure page
                            // window.location.href = '/payment/failed';
                        } else {
                            // Handle different payment statuses
                            switch (data.status) {
                                case 'completed':
                                    alert('Payment successful!');
                                    setIsLoading(false)
                                    setHasPurchased(true);
                                    handleDownload(productId)
                                    break;
                                case 'authorized':
                                    alert('Payment authorized, awaiting capture');
                                    // Maybe redirect to a pending page
                                    break;
                                case 'pending':
                                    alert('Payment is pending');
                                    // Show pending status
                                    break;
                                default:
                                    alert(`Payment status: ${data.status}`);
                            }
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Payment verification failed');
                        // Redirect to failure page
                        // window.location.href = '/payment/failed';
                    }
                },
                notes: {
                    skip_contact_form: 1
                },
                theme: {
                    color: '#F37254',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Error:', error);
            // alert('Something went wrong!');
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
                body: JSON.stringify({
                    bookId,
                    // bookId: '103f22f7-f189-48be-83ea-36ef5b42ee55',
                }),
            });

            const allData = await response.json();
            const { urls, error } = allData

            if (!response.ok) {
                // throw new Error(error ?? 'Failed to get download URL');
                setIsFetchingDownloadUrls(false);
                // toast({
                //     variant: "destructive",
                //     title: "Error",
                //     description: error ?? 'Failed to get download URL',
                // });
                return;
            }


            setIsFetchingDownloadUrls(false);
            setDownloadUrls(urls);
            // setIsDownloadDialogOpen(true);
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
            const { downloadUrl: downlaodUrlMain, fileName, fileType } = downloadData;
            if (!downlaodUrlMain || !fileName) return;
            const response = await fetch(downlaodUrlMain);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;

            // Fix: Add null check for filename
            const filename = fileName || 'download';
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }

    // Format amount according to user's locale
    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const formattedAmount = localCurrency ? new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: localCurrency,
    }).format(localAmount) : null;
    // console.log("super......", localCurrency)

    if (hasPurchased) {
        return (
            <>
                <button
                    onClick={() => {
                        // console.log("downloadUrls=>", downloadUrls)
                        if (downloadUrls?.length) {
                            downloadFile(downloadUrls[0])
                        } else {
                            alert("File not found!")
                        }
                    }}
                    className="px-4 py-2 flex bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isFetchingDownloadUrls && (
                        <Loader2Icon width={20} className='animate-spin mr-2' />
                    )}
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
                                        <a href={downloadUrl?.downloadUrl} download={downloadUrl?.fileName}
                                            target="_blank"
                                            className="flex items-center space-x-2 rounded-sm px-4 py-3 hover:underline text-white bg-blue-400">
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
                onClick={userId ? handlePayment : () => {
                    setIsLoginNeededDialogOpen(true)
                }}
                disabled={isLoading}
                className="px-4 py-2 h-[40px] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ?
                    'Processing...' :
                    isInitialFetching ?
                        <span className='inline-flex'>
                            <Loader2Icon width={16} className='animate-spin mr-1' />
                            <span>Fetching</span>
                        </span>
                        : `Buy ebook ${formattedAmount ?? '-'}`}
            </button>
            <AlertDialog open={isLoginNeededDialogOpen} onOpenChange={setIsLoginNeededDialogOpen}>
                <AlertDialogContent className='bg-white'>
                    <AlertDialogTitle className='hidden'></AlertDialogTitle>
                    <Card className="w-full max-w-md border-0">
                        <CardHeader className="relative">
                            <CardTitle className="text-2xl font-bold text-center">Login Required</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => setIsLoginNeededDialogOpen(false)}
                                aria-label="Close popup"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">
                                You need to be logged in to make a purchase. Please sign up or sign in to continue.
                            </p>
                        </CardContent>
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