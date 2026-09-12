"use client"
import BookCard from "@/components/BookCard"
import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client'
import { Skeleton } from "@/components/ui/skeleton"

const BookCardSkeleton = () => {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-20 w-full" />
        </div>
    )
}

export default function TrendingBooksCollections({ loggedinUserId }: {
    loggedinUserId?: string
}) {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(true);
    const [authorBooks, setAuthorBooks] = useState<any>([]);

    useEffect(() => {
        async function fetchBooks() {
            setIsLoading(true)
            try {
                const { data: layoutData, error: layoutError } = await supabase
                    .from('layout_settings')
                    .select('page_section, value')

                if (layoutError) {
                    console.error('Error fetching layout settings:', layoutError)
                    return
                }

                if (!layoutData || layoutData.length === 0) {
                    console.log('No layout settings found')
                    setIsLoading(false)
                    return
                }

                const bookIds = layoutData.map(item => item.value)

                const { data: booksData, error: booksError } = await supabase
                    .from('books')
                    .select('id, title,description,cover_images, author_name, price')
                    .in('id', bookIds).eq('isCompletelyFilled', true).eq('is_deleted', false)

                if (booksError) {
                    console.error('Error fetching books:', booksError)
                    return
                }

                const books = booksData.map(book => ({
                    id: book.id,
                    title: book.title,
                    description: book.description,
                    coverImage: book.cover_images?.[0],
                    images: book.cover_images,
                    author: book.author_name,
                    price: book.price,
                }))

                const trending = layoutData
                    .filter(item => item.page_section === 'HOMEPAGE_TRENDING')
                    .map(item => books.find(book => book.id === item.value))
                    .filter(Boolean)

                setAuthorBooks(trending)
            } catch (error) {
                console.error('Unexpected error in fetchBooks:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBooks()
    }, [])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
                [...Array(3)].map((_, index) => (
                    <BookCardSkeleton key={index} />
                ))
            ) : (
                authorBooks.map((book: any, index: number) => (
                    <BookCard key={index} book={book} loggedinUserId={loggedinUserId} />
                ))
            )}
        </div>
    )

}