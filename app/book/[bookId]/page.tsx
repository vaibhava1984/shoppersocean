import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Footer from "@/components/Footer";
import type { Metadata, ResolvingMetadata } from 'next';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';
import BookReviewSection from '@/app/components/BookReviewSection';
import BookAccess from '@/components/BookAccess';

type Props = { params: { bookId: string }; searchParams: { [key: string]: string | string[] | undefined } };

export default async function BookDetailPage({ params }: { params: any }) {
  const { bookId } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentBookDetails } = await supabase.from('books').select(`*`).eq('id', bookId).single();
  const { data: currentBookAuthorDetails } = await supabase.from('authors').select(`*`).eq('author_id', currentBookDetails?.author_id);

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

              {currentBookDetails?.id && (
                <BookAccess
                  bookId={String(bookId)}
                  title={currentBookDetails?.title || 'Book'}
                  amount={Number(currentBookDetails?.price || 0)}
                  userId={user?.id}
                />
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
