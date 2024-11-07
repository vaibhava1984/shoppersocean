"use client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const DynamicPaymentButton = dynamic(() => import('@/components/PaymentButton'), {
    loading: () => <p>Loading...</p>,
})

export default function BookCard({ book, loggedinUserId }: {
    book: any,
    loggedinUserId?: string
}) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <Toaster />
            <CardContent className="p-0 h-full flex flex-col">
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative cursor-pointer">
                            <img src={book.coverImage} alt={book.title} className="w-full h-64 object-contain" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                Click to view more images
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogTitle className="hidden"></DialogTitle>
                    <DialogContent className="max-w-3xl">
                        <Carousel>
                            <CarouselContent>
                                {book.images?.map((image: string, index: number) => (
                                    <CarouselItem key={index}>
                                        <img src={image} alt={`${book.title} - Image ${index + 1}`} className="w-full h-auto object-contain" />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </DialogContent>
                </Dialog>
                <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800"><Link href={`/book/${book.id}`}>{book.title}</Link></h3>
                        {/* <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({book.numRatings} ratings)</span>
                    </div> */}
                        <div className="mt-2">{book.description}</div>
                    </div>
                    <div className="mt-2">
                        {/* <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                        </Button> */}
                        {loggedinUserId && book?.id && (
                            <DynamicPaymentButton
                                amount={book?.price}
                                notes={{ product_name: 'Test Product' }}
                                userId={loggedinUserId}
                                productId={book?.id}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};