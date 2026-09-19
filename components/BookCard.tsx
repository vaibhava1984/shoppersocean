import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { OptimizedImage } from "@/components/OptimizedImage"
import LazyPaymentButton from "@/components/LazyPaymentButton"

export default function BookCard({ book, loggedinUserId }: {
    book: any,
    loggedinUserId?: string
}) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-0 h-full flex flex-col">
                <Link
                    href={`/book/${book.id}`}
                    className="relative block cursor-pointer"
                    aria-label={`View details for ${book.title}`}
                >
                    <OptimizedImage
                        src={book.coverImage}
                        alt={book.title}
                        width={640}
                        height={420}
                        className="w-full h-64 object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={65}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        Click to view book details
                    </div>
                </Link>
                <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800">
                            <Link href={`/book/${book.id}`}>{book.title}</Link>
                        </h3>
                        <div className="mt-2">
                            {book.description.length > 100 ? (
                                <>
                                    {book.description.slice(0, 100)}...
                                    <Link
                                        href={`/book/${book.id}`}
                                        className="text-blue-500 hover:underline ml-1"
                                    >
                                        Read More
                                    </Link>
                                </>
                            ) : (
                                book.description
                            )}
                        </div>
                    </div>
                    <div className="mt-2">
                        {book?.id && (
                            <LazyPaymentButton
                                amount={book.price}
                                notes={{ product_name: "Test Product" }}
                                userId={loggedinUserId}
                                productId={book.id}
                                productTitle={book.title}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
