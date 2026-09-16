import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import type { Metadata, ResolvingMetadata } from 'next';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';
import BookReviewSection from '@/app/components/BookReviewSection';

const DynamicPaymentButton = dynamic(() => import('@/components/PaymentButton'), { loading: () => <p>Loading...</p> });
const DynamicBookFlipbook = dynamic(() => import('@/components/BookFlipbook'), { loading: () => <div className="min-h-[420px] animate-pulse rounded-xl bg-slate-100" /> });

type Props = { params: { bookId: string }; searchParams: { [key: string]: string | string[] | undefined } };

export default async function BookDetailPage({ params }: { params: any }) {
  const { bookId } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentBookDetails } = await supabase.from('books').select(`*`).eq('id', bookId).single();
  const { data: currentBookAuthorDetails } = await supabase.from('authors').select(`*`).eq('author_id', currentBookDetails?.author_id);

  let hasPurchased = false;
  if (user?.id) {
    const { data: purchases } = await supabase
      .from('orders')
      .select('id, payments!inner(status)')
      .eq('user_id', user.id)
      .eq('product_id', bookId)
      .eq('payments.status', 'completed')
      .limit(1);
    hasPurchased = Boolean(purchases?.length);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div><AuthorApplicationBanner /></div>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Carousel>
                    <CarouselContent>
                      {currentBookDetails?.cover_images?.map((image: string | undefined, index: number) => (
                        <CarouselItem key={index} className="bg-gray-100">
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

            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold mb-2 text-slate-800">{currentBookDetails?.title}</h1>
              <p className="text-xl text-slate-600 mb-4">by {currentBookAuthorDetails?.map((author, index) => <span key={`${index}_author_name`}>{author.name}</span>)}</p>
              <div className="mb-6"><span className="text-3xl font-bold text-blue-600">₹{currentBookDetails?.price}</span></div>

              {hasPurchased ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-semibold">You own this book.</p>
                  <p className="mt-1 text-sm">Your online reader and PDF download are available below.</p>
                </div>
              ) : (
                <div className="flex items-center space-x-4 mb-6">
                  {user?.id && currentBookDetails?.id && (
                    <DynamicPaymentButton amount={currentBookDetails?.price} notes={{ product_name: currentBookDetails?.title }} userId={user.id} productId={currentBookDetails.id} />
                  )}
                </div>
              )}

              <Card className="mb-6">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-2">Book Details</h2>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-medium">Language:</span> {currentBookDetails?.language}</li>
                    <li><span className="font-medium">Published Date:</span> {currentBookDetails?.published_date}</li>
                    <li><span className="font-medium">Pages:</span> {currentBookDetails?.pages}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {hasPurchased && (
            <Card className="mt-10">
              <CardContent className="p-4 sm:p-6">
                <h2 className="mb-4 text-2xl font-bold text-slate-800">Your book</h2>
                <DynamicBookFlipbook bookId={String(bookId)} title={currentBookDetails?.title || 'Book'} />
              </CardContent>
            </Card>
          )}

          <Card className="mt-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Book Summary</h2>
              <p className="text-slate-600 whitespace-pre-line">{currentBookDetails?.description}</p>
            </CardContent>
          </Card>

          <BookReviewSection bookId={String(bookId)} userId={user?.id} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = (await params).bookId;
  const supabase = createClient();
  const { data: currentBookDetails } = await supabase.from('books').select(`title, description`).eq('id', id).single();
  return { title: currentBookDetails?.title ?? 'Book details', description: currentBookDetails?.description };
}
