"use client"
import BookCard from "@/components/BookCard"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getHomepageBooks, HomepageBook } from "@/utils/homepageBooksCache"

const BookCardSkeleton = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-20 w-full" />
    </div>
)

export default function BooksCollections({ loggedinUserId }: { loggedinUserId?: string }) {
    const [isLoading, setIsLoading] = useState(true)
    const [authorBooks, setAuthorBooks] = useState<HomepageBook[]>([])

    useEffect(() => {
        let active = true

        getHomepageBooks()
            .then(placements => {
                if (!active) return
                setAuthorBooks(
                    placements
                        .filter(item => item.pageSection === 'HOMEPAGE_COLLECTION')
                        .map(({ pageSection, ...book }) => book)
                )
            })
            .catch(error => console.error('Unexpected error in fetchBooks:', error))
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
                [...Array(4)].map((_, index) => <BookCardSkeleton key={index} />)
            ) : (
                authorBooks.map((book, index) => (
                    <BookCard key={`${book.id}-${index}`} book={book} loggedinUserId={loggedinUserId} />
                ))
            )}
        </div>
    )
}
