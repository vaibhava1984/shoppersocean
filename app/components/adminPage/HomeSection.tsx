'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Book = { id: string; title: string; author: string }
type SectionType = 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION'

type SortableBookItemProps = { book: Book; onRemove: (id: string) => void }

function SortableBookItem({ book, onRemove }: SortableBookItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: book.id })
    const style = { transform: CSS.Transform.toString(transform), transition }
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative mb-2">
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div><h4 className="text-sm font-medium">{book.title}</h4><p className="text-sm text-muted-foreground">{book.author}</p></div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(book.id)}>
                    <X className="h-4 w-4" /><span className="sr-only">Remove book</span>
                </Button>
            </div>
        </div>
    )
}

type BookSectionProps = { title: string; books: Book[]; maxBooks: number; sectionType: SectionType; onUpdateBooks: (books: Book[]) => void }

function BookSection({ title, books, maxBooks, sectionType, onUpdateBooks }: BookSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<Book[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

    async function handleSearch(query: string) {
        setSearchQuery(query)
        setErrorMessage('')
        if (query.trim().length < 2) { setSearchResults([]); return }
        setIsSearching(true)
        try {
            const response = await fetch(`/api/homepage_sections?search=${encodeURIComponent(query.trim())}`, { cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Unable to search books')
            setSearchResults(payload.books || [])
        } catch (error) {
            console.error('Error searching books:', error)
            setSearchResults([])
            setErrorMessage('Unable to search books. Please try again.')
        } finally { setIsSearching(false) }
    }

    async function handleBookSelect(book: Book) {
        if (books.length >= maxBooks || isSaving) return
        setIsSaving(true)
        setErrorMessage('')
        try {
            const response = await fetch('/api/homepage_sections', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageSection: sectionType, bookId: book.id }),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Unable to save book')
            onUpdateBooks([...books, book])
            setSearchResults([]); setSearchQuery(''); setIsDialogOpen(false)
        } catch (error) {
            console.error('Error saving book selection:', error)
            setErrorMessage(error instanceof Error ? error.message : 'Unable to save book. Please try again.')
        } finally { setIsSaving(false) }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = books.findIndex((book) => book.id === active.id)
            const newIndex = books.findIndex((book) => book.id === over.id)
            onUpdateBooks(arrayMove(books, oldIndex, newIndex))
        }
    }

    function handleRemoveBook(id: string) { onUpdateBooks(books.filter((book) => book.id !== id)) }

    return (
        <Card className="mb-8">
            <CardHeader><CardTitle>{title}</CardTitle><CardDescription>Select up to {maxBooks} books for this section</CardDescription></CardHeader>
            <CardContent>
                <Button type="button" onClick={() => setIsDialogOpen(true)} disabled={books.length >= maxBooks} className="mb-4">Add {maxBooks} books for {title}</Button>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={books.map((book) => book.id)} strategy={verticalListSortingStrategy}>
                        {books.map((book) => <SortableBookItem key={book.id} book={book} onRemove={handleRemoveBook} />)}
                    </SortableContext>
                </DndContext>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) { setSearchResults([]); setSearchQuery(''); setErrorMessage('') }
                }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Search Books</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <Input placeholder="Search by title or author..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} autoFocus />
                            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                {isSearching ? <p className="py-3 text-sm text-muted-foreground">Searching...</p> : searchResults.length === 0 && searchQuery.trim().length >= 2 ? <p className="py-3 text-sm text-muted-foreground">No books found.</p> : searchResults.map((book) => (
                                    <Button key={book.id} type="button" variant="outline" className="h-auto min-h-12 w-full justify-start whitespace-normal py-3 text-left" disabled={isSaving} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void handleBookSelect(book) }}>
                                        <div className="text-left"><div className="font-medium">{book.title}</div><div className="text-sm text-muted-foreground">{book.author}</div></div>
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
    return <div className="space-y-8">
        <BookSection title="Trending Books" books={trendingBooks} maxBooks={3} sectionType="HOMEPAGE_TRENDING" onUpdateBooks={setTrendingBooks} />
        <BookSection title="Books Collection" books={collectionBooks} maxBooks={4} sectionType="HOMEPAGE_COLLECTION" onUpdateBooks={setCollectionBooks} />
    </div>
}
