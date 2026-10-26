import { getCurrentUser } from "@/utils/auth/session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
import { getD1 } from "@/utils/cloudflare/d1";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Footer from "@/components/Footer";
import nextDynamic from "next/dynamic";
import type { Metadata, ResolvingMetadata } from "next";
import AuthorApplicationBanner from "@/app/components/AuthorApplicationBanner";
import BookReviewSection from "@/app/components/BookReviewSection";
import BookPriceDisplay from "@/components/BookPriceDisplay";

const DynamicPaymentButton = nextDynamic(() => import("@/components/PaymentButton"), { loading: () => <p>Loading...</p> });

type Props = { params: { bookId: string }; searchParams: { [key: string]: string | string[] | undefined } };

function formatPublishedDate(value: unknown): string {
    const date = String(value ?? "").trim();
    const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return iso ? `${iso[3]}-${iso[2]}-${iso[1]}` : date;
}

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
    const user = await getCurrentUser();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const currentBookDetails = await db.prepare(
        "SELECT * FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(bookId).first<Record<string, any>>();
    if (!currentBookDetails) return <div className="min-h-screen"><Header /><div className="p-10 text-center">Book not found.</div><Footer /></div>;

    const authorRows = currentBookDetails.author_id
        ? await db.prepare("SELECT * FROM authors WHERE id = ? AND COALESCE(is_deleted, 0) = 0").bind(currentBookDetails.author_id).all<Record<string, any>>()
        : { results: [] };
    const isAuthorBook = user?.id && currentBookDetails.author_id
        ? await db.prepare(
            "SELECT id FROM authors WHERE id = ? AND user_id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
          ).bind(String(currentBookDetails.author_id), String(user.id)).first<{ id: string }>()
        : null;
    const images = parseImages(currentBookDetails.cover_images);

    return <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <div><AuthorApplicationBanner /></div>
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50" aria-label="Back to homepage">
                    <ArrowLeft className="h-5 w-5" /> Back to homepage
                </Link>
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
                        <div className="mb-6">{String(user?.publicMetadata.userrole ?? "").trim().toUpperCase() !== "ADMIN" && <span className="text-3xl font-bold text-blue-600"><BookPriceDisplay bookId={String(currentBookDetails.id)} /></span>}</div>
                        <div className="mb-6 w-full min-w-0">
                            {currentBookDetails.id && <DynamicPaymentButton amount={Number(currentBookDetails.price || 0)} notes={{ product_name: currentBookDetails.title }} userId={user?.id} isAdmin={String(user?.publicMetadata.userrole ?? "").trim().toUpperCase() === "ADMIN"} isAuthorBook={Boolean(isAuthorBook)} productId={String(currentBookDetails.id)} productTitle={currentBookDetails.title} />}
                        </div>
                        <Card className="mb-6"><CardContent className="p-4"><h2 className="text-lg font-semibold mb-2">Book Details</h2><ul className="space-y-1 text-sm">
                            <li><span className="font-medium">Language:</span> {currentBookDetails.language}</li>
                            <li><span className="font-medium">Published Date:</span> {formatPublishedDate(currentBookDetails.published_date)}</li>
                            <li><span className="font-medium">Flipbook Pages:</span> {currentBookDetails.pages}</li>
                        </ul></CardContent></Card>
                    </div>
                </div>
                <Card className="mt-12"><CardContent className="p-6"><h2 className="text-2xl font-bold mb-4 text-slate-800">Book Summary</h2><p className="text-slate-600 whitespace-pre-line">{currentBookDetails.description}</p></CardContent></Card>
                <BookReviewSection bookId={String(bookId)} userId={user?.id} isAdmin={String(user?.publicMetadata.userrole ?? "").trim().toUpperCase() === "ADMIN"} />
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
    return {
        title: book?.title ?? "Book details",
        description: book?.description ?? undefined,
        alternates: { canonical: `https://shoppersocean.com/book/${encodeURIComponent(id)}` },
    };
}
