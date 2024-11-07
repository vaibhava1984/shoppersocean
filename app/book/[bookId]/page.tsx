import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Footer from "@/components/Footer"
import dynamic from 'next/dynamic'
import type { Metadata, ResolvingMetadata } from 'next'

const DynamicPaymentButton = dynamic(() => import('@/components/PaymentButton'), {
    loading: () => <p>Loading...</p>,
})

type Props = {
    params: { bookId: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BookDetailPage({ params }: {
    params: any
}) {
    const { bookId } = await params
    // console.log("bookId yeah===>", bookId)
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { data: currentBookDetails, error } = await supabase.from('books').select(`
       *
    `).eq('id', bookId).single();
    const { data: currentBookAuthorDetails, error: currentBookAuthorDetailsError } = await supabase.from('authors').select(`
        *
     `).eq('author_id', currentBookDetails.author_id);
    // console.log("currentBookDetails===>", currentBookDetails)
    // console.log("currentBookAuthorDetails===>", currentBookAuthorDetails)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            {/* Book Detail Content */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column - Book Images */}
                        <div className="md:w-1/2">
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <Carousel>
                                        <CarouselContent>
                                            {currentBookDetails.cover_images.map((image: string | undefined, index: number) => (
                                                <CarouselItem key={index} className='bg-gray-100'>
                                                    <img src={image} alt={`${currentBookDetails.title} - Image ${index + 1}`} className="mx-auto h-[29rem]" />
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Book Details */}
                        <div className="md:w-1/2">
                            <h1 className="text-3xl font-bold mb-2 text-slate-800">{currentBookDetails.title}</h1>
                            <p className="text-xl text-slate-600 mb-4">by {currentBookAuthorDetails?.map((currentBookAuthorDetail, currentBookAuthorDetailIndex) => (
                                <span key={`${currentBookAuthorDetailIndex}_author_name`}>{currentBookAuthorDetail.name}</span>
                            ))}</p>
                            {/* <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-2 text-sm text-gray-600">({book.numRatings} ratings)</span>
                            </div> */}
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-blue-600">₹{currentBookDetails?.price}</span>
                                {/* {book.originalPrice > book.price && (
                                    <span className="ml-2 text-lg text-gray-500 line-through">₹{book.originalPrice}</span>
                                )} */}
                            </div>
                            <div className="flex items-center space-x-4 mb-6">
                                {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                                </Button> */}
                                {user?.id && currentBookDetails?.id && (
                                    <DynamicPaymentButton
                                        amount={currentBookDetails?.price}
                                        notes={{ product_name: 'Test Product' }}
                                        userId={user?.id}
                                        productId={currentBookDetails?.id}
                                    />
                                )}
                            </div>
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <h2 className="text-lg font-semibold mb-2">Book Details</h2>
                                    <ul className="space-y-1 text-sm">
                                        <li><span className="font-medium">ISBN:</span> {currentBookDetails?.isbn}</li>
                                        <li><span className="font-medium">Language:</span> {currentBookDetails?.language}</li>
                                        <li><span className="font-medium">Binding:</span> {currentBookDetails?.binding}</li>
                                        <li><span className="font-medium">Publisher:</span> {currentBookDetails?.publisher}</li>
                                        <li><span className="font-medium">Published Date:</span> {currentBookDetails?.published_date}</li>
                                        <li><span className="font-medium">Pages:</span> {currentBookDetails?.pages}</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Book Summary */}
                    <Card className="mt-12">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-slate-800">Book Summary</h2>
                            <p className="text-slate-600 whitespace-pre-line">{currentBookDetails?.description}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = (await params).bookId
    const supabase = createClient();

    const { data: currentBookDetails, error } = await supabase.from('books').select(`
        title,
        description
     `).eq('id', id).single();

    return {
        title: currentBookDetails?.title ?? 'Book details',
        description: currentBookDetails?.description
    }
}