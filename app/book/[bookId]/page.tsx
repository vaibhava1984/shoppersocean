import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
import { getD1 } from "@/utils/cloudflare/d1";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import type { Metadata, ResolvingMetadata } from "next";
import AuthorApplicationBanner from "@/app/components/AuthorApplicationBanner";
import BookReviewSection from "@/app/components/BookReviewSection";

const DynamicPaymentButton = dynamic(() => import("@/components/PaymentButton"), { loading: () => <p>Loading...</p> });

type Props = { params: { bookId: string }; searchParams: { [key: string]: string | string[] | undefined } };

function parseImages(value: unknown): string[] {
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
        } catch { return value ? [value] : []; }
    }
    return [];
}

export default async function BookDetailPage({ params }: { params: any }) {
    const { bookId } = await params;
    const db = getD1();
    const user = await currentUser();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const currentBookDetails = await db.prepare(
        "SELECT * FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(bookId).first<Record<string, any>>();
    if (!currentBookDetails) return <div className="min-h-screen"><Header /><div className="p-10 text-center">Book not found.</div><Footer /></div>;

    const authorRows = currentBookDetails.author_id
        ? await db.prepare("SELECT * FROM authors WHERE author_id = ? AND COALESCE(is_deleted, 0) = 0").bind(currentBookDetails.author_id).all<Record<string, any>>()
        : { results: [] };
    const images = parseImages(currentBookDetails.cover_images);

    return <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <div><AuthorApplicationBanner /></div>
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <Card className="overflow-hidden"><CardContent className="p-0">
                            <Carousel><CarouselContent>
                                {images.map((image, index) => <CarouselItem key={index} className="bg-gray-100"><img src={image} alt={`${currentBookDetails.title} - Image ${index + 1}`} className="mx-auto h-[29rem]" /></CarouselItem>)}
                            </CarouselContent><CarouselPrevious /><CarouselNext /></Carousel>
                        </CardContent></Card>
                    </div>
                    <div className="md:w-1/2">
                        <h1 className="text-3xl font-bold mb-2 text-slate-800">{currentBookDetails.title}</h1>
                        <p className="text-xl text-slate-600 mb-4">by {authorRows.results.map((a, i) => <span key={`${i}_author_name`}>{a.name}</span>)}</p>
                        <div className="mb-6"><span className="text-3xl font-bold text-blue-600">₹{currentBookDetails.price}</span></div>
                        <div className="flex items-center space-x-4 mb-6">
                            {user?.id && currentBookDetails.id && <DynamicPaymentButton amount={Number(currentBookDetails.price || 0)} notes={{ product_name: currentBookDetails.title }} userId={user.id} productId={String(currentBookDetails.id)} productTitle={currentBookDetails.title} />}
                        </div>
                        <Card className="mb-6"><CardContent className="p-4"><h2 className="text-lg font-semibold mb-2">Book Details</h2><ul className="space-y-1 text-sm">
                            <li><span className="font-medium">Language:</span> {currentBookDetails.language}</li>
                            <li><span className="font-medium">Published Date:</span> {currentBookDetails.published_date}</li>
                            <li><span className="font-medium">Pages:</span> {currentBookDetails.pages}</li>
                        </ul></CardContent></Card>
                    </div>
                </div>
                <Card className="mt-12"><CardContent className="p-6"><h2 className="text-2xl font-bold mb-4 text-slate-800">Book Summary</h2><p className="text-slate-600 whitespace-pre-line">{currentBookDetails.description}</p></CardContent></Card>
                <BookReviewSection bookId={String(bookId)} userId={user?.id} />
            </div>
        </section>
        <Footer />
    </div>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const id = (await params).bookId;
    const db = getD1();
    if (!db) return { title: "Book details" };
    const book = await db.prepare("SELECT title, description FROM books WHERE id = ? LIMIT 1").bind(id).first<Record<string, any>>();
    return { title: book?.title ?? "Book details", description: book?.description ?? undefined };
}
