import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/Header"
import LanguageMenusLists from "@/app/components/LanguageMenusLists"
import AuthorsMenusLists from "@/app/components/AuthorsMenusLists"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Footer from "@/components/Footer"
import { Star } from 'lucide-react'
import dynamic from "next/dynamic";
import BookCard from "@/components/BookCard"
import HeroSection from "@/components/HeroSection";
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

export const metadata = {
    title: 'BookShelf',
    description: 'Escape into Entertainment',
}

// ✅ ISR: Revalidate every 1 hour (3600 seconds)
// This generates a static page and regenerates it in the background if needed
export const revalidate = 3600;

// ✅ Dynamic rendering based on search params
export const dynamicParams = true;

export default async function BookShelfPage({ params, searchParams }: { params: any; searchParams: any }) {
    const searchparams1 = await searchParams;
    const searchFilters = {
        language: searchparams1?.lang ?? 'all',
        author_id: searchparams1?.author ?? 'all'
    }

    const supabase = createClient();
    
    let user = null;
    try {
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();
        user = authUser;
    } catch (error) {
        console.error('Error fetching user:', error);
    }

    // ✅ Build query with only needed columns
    let query = supabase
        .from('books')
        .select('id,title,language,author_id,author,description,price,cover_images')
        .eq('isCompletelyFilled', true)
        .eq('is_deleted', false)
        .limit(100)
        .order('title', { ascending: true }); // Add consistent ordering for caching

    // ✅ Apply filters at database level
    if (searchFilters.language !== 'all') {
        const languageMap: Record<string, string> = {
            'en': 'English',
            'hindi': 'Hindi'
        };
        const language = languageMap[searchFilters.language];
        if (language) {
            query = query.eq('language', language);
        }
    }

    if (searchFilters.author_id !== 'all' && searchFilters.author_id?.length > 0) {
        query = query.eq('author_id', searchFilters.author_id);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching books:', error);
    }

    const books = data || [];

    const filteredBooks = books.map(d => ({
        ...d,
        coverImage: d?.cover_images?.[0],
        images: d?.cover_images,
    }));

    const authorInfo = {
        "Chetan Bhagat": `Chetan Bhagat is the author of seven blockbuster books. These include six novels—Five Point Someone (2004), One Night @ the Call Center (2005), The 3 Mistakes of My Lif[...]

    Chetan's books have remained bestsellers since their release and have been equally celebrated on the big screen.

    The New York Times called him the 'the biggest selling English language novelist in India's history'. TIME magazine named him amongst the '100 most influential people in the world' and Fast Co[...]

    Chetan writes columns for leading English and Hindi newspapers, focusing on youth and national development issues. He is also a motivational speaker and screenplay writer.

    Chetan quit his international investment banking career in 2009 to devote his entire time to writing and making change happen in the country. He lives in Mumbai with his wife, Anusha, an ex-cl[...]`,
        "Amish Tripathi": `Amish Tripathi is an Indian author known for his novels The Shiva Trilogy and the Ram Chandra Series. His debut work, The Immortals of Meluha, was a bestseller that earn[...]`,
        "Sudha Murty": `Sudha Murty is an Indian engineering teacher, author and social worker. She is the chairperson of the Infosys Foundation and a member of public health care initiatives of t[...]`
    }

    function getPageHeader() {
        if (searchFilters.language === 'en') {
            return 'English Books'
        }
        if (searchFilters.language === 'hindi') {
            return 'Hindi Books'
        }

        return 'All Books'
    }

    const selectedAuthorName = searchFilters.author_id !== 'all' ? filteredBooks[0]?.author : null;
    const selectedAuthorInfo = selectedAuthorName ? authorInfo[selectedAuthorName as keyof typeof authorInfo] : null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Navigation */}
            <Header />
            <div>
                <HeroSection
                    title=" Escape into Entertainment"
                    subtitle="Discover your next favorite book"
                    imageSrc="/bookshelf_hero_image.jpeg"
                    imageAlt=" Embark on Your Adventure"
                />
            </div>
            <div>
                <AuthorApplicationBanner />
            </div>
            {/* Main Content */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Sidebar */}
                        <div className="md:w-1/4">
                            <h2 className="text-2xl font-bold mb-4 text-slate-800">Categories</h2>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-2 text-slate-700">Language</h3>
                                <LanguageMenusLists />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-slate-700">Authors</h3>
                                <AuthorsMenusLists />
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="md:w-3/4">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-slate-800">
                                    {getPageHeader()}
                                </h2>
                            </div>

                            {selectedAuthorInfo && filteredBooks.length > 0 && (
                                <Card className="mb-8">
                                    <CardContent className="p-6">
                                        <h3 className="text-2xl font-bold mb-4 text-slate-800">{selectedAuthorName}</h3>
                                        <p className="text-slate-600 whitespace-pre-line">{selectedAuthorInfo}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredBooks.map(book => (
                                        <BookCard key={book.id} book={book} loggedinUserId={user?.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-600 text-lg">No books found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}
