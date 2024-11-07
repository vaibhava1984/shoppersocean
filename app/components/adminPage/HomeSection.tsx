'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@supabase/supabase-js'

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

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Book = {
    id: string
    title: string
    author: string
}

type SortableBookItemProps = {
    book: Book
    onRemove: (id: string) => void
}

function SortableBookItem({ book, onRemove }: SortableBookItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: book.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
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
                    onClick={() => onRemove(book.id)}
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
    sectionType: 'TRENDING' | 'COLLECTION'
    onUpdateBooks: (books: Book[]) => void
}

function BookSection({ title, books, maxBooks, sectionType, onUpdateBooks }: BookSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<Book[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleSearch(query: string) {
        setSearchQuery(query)
        if (query.length < 2) return

        const { data, error } = await supabase
            .from('books')
            .select('id, title, author')
            .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
            .limit(5)

        if (error) {
            console.error('Error searching books:', error)
            return
        }

        setSearchResults(data)
    }

    async function handleBookSelect(book: Book) {
        if (books.length >= maxBooks) return

        // Save to layout_settings table
        const { error } = await supabase
            .from('layout_settings')
            .insert([
                {
                    page_section: sectionType,
                    value: book.title,
                },
            ])

        if (error) {
            console.error('Error saving book selection:', error)
            return
        }

        onUpdateBooks([...books, book])
        setIsDialogOpen(false)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = books.findIndex((book) => book.id === active.id)
            const newIndex = books.findIndex((book) => book.id === over.id)

            const newBooks = arrayMove(books, oldIndex, newIndex)
            onUpdateBooks(newBooks)
        }
    }

    function handleRemoveBook(id: string) {
        onUpdateBooks(books.filter((book) => book.id !== id))
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

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={books.map((book) => book.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {books.map((book) => (
                            <SortableBookItem
                                key={book.id}
                                book={book}
                                onRemove={handleRemoveBook}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

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

    return (
        <div className="space-y-8">
            <BookSection
                title="Trending Books"
                books={trendingBooks}
                maxBooks={3}
                sectionType="TRENDING"
                onUpdateBooks={setTrendingBooks}
            />
            <BookSection
                title="Books Collection"
                books={collectionBooks}
                maxBooks={4}
                sectionType="COLLECTION"
                onUpdateBooks={setCollectionBooks}
            />
        </div>
    )
}