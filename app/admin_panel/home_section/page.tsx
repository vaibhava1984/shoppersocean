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

type SectionEntry = {
    entryId: number
    pageSection: string
    id: string
    title: string | null
    author: string | null
    missing: boolean
}

type SortableBookItemProps = {
    entry: SectionEntry
    onRemove: (entryId: number) => void
}

function SortableBookItem({ entry, onRemove }: SortableBookItemProps) {

    return (
        <div
            className="relative mb-2"
        >
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div>
                    <h4 className="text-sm font-medium">
                        {entry.title ?? 'Book no longer available'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {entry.missing
                            ? 'This book was deleted — remove it to free up a slot'
                            : entry.author}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                        onRemove(entry.entryId)
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
    entries: SectionEntry[]
    maxBooks: number
    sectionType: 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION' | 'HS'
    onAdded: (entry: SectionEntry) => void
    onRemoved: (entryId: number) => void
}

function BookSection({ title, entries, maxBooks, sectionType, onAdded, onRemoved }: BookSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<Book[]>([])
    const [isSaving, setIsSaving] = React.useState(false)
    const { toast } = useToast()

    async function handleSearch(query: string) {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        const { data, error } = await supabase
            .from('books')
            .select('id, title, author_name')
            .or(`title.ilike.%${query}%,author_name.ilike.%${query}%`)
            .eq('isCompletelyFilled', true)
            .eq('is_deleted', false)
            .limit(15);

        if (error) {
            console.error('Error searching books:', error)
            toast({
                title: "Search failed",
                description: error.message,
                variant: "destructive",
            })
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
        if (entries.length >= maxBooks || isSaving) return

        if (entries.some(entry => entry.id === book.id)) {
            toast({
                title: "Book already selected",
                description: "This book is already in the list.",
                variant: "destructive",
            })
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/homepage_sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageSection: sectionType, bookId: book.id }),
            })
            const payload = await response.json()

            if (!response.ok) {
                toast({
                    title: "Could not add book",
                    description: payload.error ?? 'Please try again.',
                    variant: "destructive",
                })
                return
            }

            onAdded(payload.entry)
            setIsDialogOpen(false)
            setSearchQuery('')
            setSearchResults([])
            toast({
                title: "Success",
                description: `"${book.title}" added to ${title}.`,
            })
        } catch (error) {
            console.error('Error saving book selection:', error)
            toast({
                title: "Could not add book",
                description: "Please check your connection and try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    async function handleRemoveBook(entryId: number) {
        try {
            const response = await fetch('/api/homepage_sections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId }),
            })

            if (!response.ok) {
                const payload = await response.json()
                toast({
                    title: "Error",
                    description: payload.error ?? 'Failed to remove book. Please try again.',
                    variant: "destructive",
                })
                return
            }

            onRemoved(entryId)
            toast({
                title: "Success",
                description: "Book removed successfully.",
            })
        } catch (error) {
            console.error('Error removing book from database:', error)
            toast({
                title: "Error",
                description: "Failed to remove book. Please try again.",
                variant: "destructive",
            })
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
                    disabled={entries.length >= maxBooks}
                    className="mb-4"
                >
                    {entries.length >= maxBooks
                        ? `${title} is full (${maxBooks}/${maxBooks}) — remove a book to add another`
                        : `Add books for ${title} (${entries.length}/${maxBooks})`}
                </Button>
                {entries.map((entry) => (
                    <SortableBookItem
                        key={entry.entryId}
                        entry={entry}
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
                                        key={book.id}
                                        variant="outline"
                                        className="w-full justify-start"
                                        disabled={isSaving}
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
    const [entries, setEntries] = React.useState<SectionEntry[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const { toast } = useToast()

    React.useEffect(() => {
        async function fetchSections() {
            setIsLoading(true)
            try {
                const response = await fetch('/api/homepage_sections')
                const payload = await response.json()

                if (!response.ok) {
                    toast({
                        title: "Could not load homepage sections",
                        description: payload.error ?? 'Please try again.',
                        variant: "destructive",
                    })
                    return
                }

                setEntries(payload.sections)
            } catch (error) {
                console.error('Unexpected error in fetchSections:', error)
                toast({
                    title: "Could not load homepage sections",
                    description: "Please check your connection and try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchSections()
    }, [toast])

    function handleAdded(entry: SectionEntry) {
        setEntries((current) => [...current, entry])
    }

    function handleRemoved(entryId: number) {
        setEntries((current) => current.filter((entry) => entry.entryId !== entryId))
    }

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
                            entries={entries.filter((entry) => entry.pageSection === 'HOMEPAGE_TRENDING')}
                            maxBooks={3}
                            sectionType="HOMEPAGE_TRENDING"
                            onAdded={handleAdded}
                            onRemoved={handleRemoved}
                        />
                        <BookSection
                            title="Books Collection"
                            entries={entries.filter((entry) => entry.pageSection === 'HOMEPAGE_COLLECTION')}
                            maxBooks={4}
                            sectionType="HOMEPAGE_COLLECTION"
                            onAdded={handleAdded}
                            onRemoved={handleRemoved}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
