'use client'
import * as React from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import AdminSidebar from "../adminSidebar"

// Initialize Supabase client
const supabase = createClient()

type Book = {
    id: string
    title: string
    author: string
}

type SortableBookItemProps = {
    book: Book
    onRemove: (title: string) => void
}

function SortableBookItem({ book, onRemove }: SortableBookItemProps) {

    return (
        <div
            className="relative mb-2"
        >
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div>
                    <h4 className="text-sm font-medium">{book.title}</h4>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                        onRemove(book.id)
                    }}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove book</span>
                </Button>
            </div>
        </div>
    )
}

type BookSectionProps = {
    title: string
    books: Book[]
    maxBooks: number
    sectionType: 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION' | 'HS'
    onUpdateBooks: (books: Book[]) => void
}

function BookSection({ title, books, maxBooks, sectionType, onUpdateBooks }: BookSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<Book[]>([])
    const { toast } = useToast()

    async function handleSearch(query: string) {
        setSearchQuery(query)
        if (query.length < 2) return

        const { data, error } = await supabase
            .from('books')
            .select('id, title, author_name')
            .or(`title.ilike.%${query}%,author_name.ilike.%${query}%`)
            .limit(15);

        if (error) {
            console.error('Error searching books:', error)
            return
        }

        const mappedBooks = data.map((book: any) => ({
            id: book.id,
            title: book.title,
            author: book.author_name,
        }));

        setSearchResults(mappedBooks)
    }

    async function handleBookSelect(book: Book) {
        if (books.length >= maxBooks) return

        // Check if the book is already selected
        if (books.some(b => b.id === book.id)) {
            toast({
                title: "Book already selected",
                description: "This book is already in the list.",
                variant: "destructive",
            })
            return
        }

        // Save to layout_settings table
        const { error } = await supabase
            .from('layout_settings')
            .insert([
                {
                    page_section: sectionType,
                    value: book.id,
                },
            ])

        if (error) {
            console.error('Error saving book selection:', error)
            return
        }

        onUpdateBooks([...books, book])
        setIsDialogOpen(false)
    }

    async function handleRemoveBook(id: string) {
        // console.log("Removing book:", id);

        // Remove from UI
        const newBooks = books.filter((book) => book.id !== id);
        onUpdateBooks(newBooks);  // Ensure the parent state is updated

        // Remove from database
        const { error } = await supabase
            .from('layout_settings')
            .delete()
            .match({ page_section: sectionType, value: id });

        if (error) {
            console.error('Error removing book from database:', error);
            toast({
                title: "Error",
                description: "Failed to remove book from database. Please try again.",
                variant: "destructive",
            });

            // Revert UI change if database operation failed
            // In case of an error, we want to revert the UI back to its original state
            onUpdateBooks(books);  // Revert to original state
        } else {
            toast({
                title: "Success",
                description: "Book removed successfully.",
            });
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Select up to {maxBooks} books for this section
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    disabled={books.length >= maxBooks}
                    className="mb-4"
                >
                    Add {maxBooks} books for {title}
                </Button>
                {books.map((book) => (
                    <SortableBookItem
                        key={book.title}
                        book={book}
                        onRemove={handleRemoveBook}
                    />
                ))}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Search Books</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Search by title or author..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <div className="space-y-2">
                                {searchResults.map((book) => (
                                    <Button
                                        key={book.title}
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => handleBookSelect(book)}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium">{book.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {book.author}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default function HomeSection() {
    const [trendingBooks, setTrendingBooks] = React.useState<Book[]>([])
    const [collectionBooks, setCollectionBooks] = React.useState<Book[]>([])
    const [heroSectionImage, setHeroSectionImage] = React.useState<Book[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
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
                    .select('id, title, author_name')
                    .in('id', bookIds)

                if (booksError) {
                    console.error('Error fetching books:', booksError)
                    return
                }

                const books = booksData.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author_name,
                }))

                const trending = layoutData
                    .filter(item => item.page_section === 'HOMEPAGE_TRENDING')
                    .map(item => books.find(book => book.id === item.value))
                    .filter(Boolean) as Book[]

                const collection = layoutData
                    .filter(item => item.page_section === 'HOMEPAGE_COLLECTION')
                    .map(item => books.find(book => book.id === item.value))
                    .filter(Boolean) as Book[]

                const heroSection = layoutData
                    .filter(item => item.page_section === 'HS')
                    .map(item => books.find(book => book.id === item.value))
                    .filter(Boolean) as Book[]

                setTrendingBooks(trending)
                setCollectionBooks(collection)
                setHeroSectionImage(heroSection)
            } catch (error) {
                console.error('Unexpected error in fetchBooks:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBooks()
    }, [])

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <BookSection
                            title="Trending Books"
                            books={trendingBooks}
                            maxBooks={3}
                            sectionType="HOMEPAGE_TRENDING"
                            onUpdateBooks={setTrendingBooks}
                        />
                        <BookSection
                            title="Books Collection"
                            books={collectionBooks}
                            maxBooks={4}
                            sectionType="HOMEPAGE_COLLECTION"
                            onUpdateBooks={setCollectionBooks}
                        />
                    </>
                )}
            </main>
        </div>
    )
}