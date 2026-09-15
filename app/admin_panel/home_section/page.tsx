'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminSidebar from '../adminSidebar'
import { useToast } from '@/hooks/use-toast'

type Book = { id: string; title: string; author: string }
type Entry = { entryId: number; pageSection: string; id: string; title: string | null; author: string | null; missing: boolean }
type SectionType = 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION'

function Picker({ open, title, query, results, searching, saving, onClose, onQuery, onSelect }: {
    open: boolean; title: string; query: string; results: Book[]; searching: boolean; saving: boolean
    onClose: () => void; onQuery: (value: string) => void; onSelect: (book: Book) => void
}) {
    if (!open) return null
    return <div className="fixed inset-0 z-[100] bg-black/50 p-4" onClick={onClose}>
        <div className="mx-auto mt-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Search Books</h2>
                <button type="button" aria-label="Close" className="rounded-md p-2 hover:bg-gray-100" onClick={onClose}><X className="h-5 w-5" /></button>
            </div>
            <Input autoFocus placeholder="Search by title or author..." value={query} onChange={(e) => onQuery(e.target.value)} />
            <p className="mt-2 text-xs text-muted-foreground">Adding to: {title}</p>
            <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
                {searching ? <p className="py-4 text-sm text-muted-foreground">Searching...</p> : query.trim().length >= 2 && results.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No books found.</p> : results.map((book) => <button key={book.id} type="button" disabled={saving} className="block min-h-14 w-full rounded-md border bg-white px-4 py-3 text-left touch-manipulation hover:bg-gray-50 disabled:opacity-50" onClick={() => onSelect(book)}><div className="font-medium">{book.title}</div><div className="text-sm text-muted-foreground">{book.author || 'Unknown author'}</div></button>)}
            </div>
        </div>
    </div>
}

function BookSection({ title, sectionType, entries, maxBooks, onAdded, onRemoved }: {
    title: string; sectionType: SectionType; entries: Entry[]; maxBooks: number
    onAdded: (entry: Entry) => void; onRemoved: (id: number) => void
}) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<Book[]>([])
    const [searching, setSearching] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const { toast } = useToast()

    async function search(value: string) {
        setQuery(value)
        if (value.trim().length < 2) { setResults([]); return }
        setSearching(true)
        try {
            const response = await fetch(`/api/homepage_sections?search=${encodeURIComponent(value.trim())}`, { cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Search failed (${response.status})`)
            setResults(payload.books || [])
        } catch (error) {
            setResults([])
            toast({ title: 'Search failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })
        } finally { setSearching(false) }
    }

    async function selectBook(book: Book) {
        if (saving || entries.length >= maxBooks || entries.some((e) => e.id === book.id)) return
        setSaving(true)
        try {
            const response = await fetch('/api/homepage_sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageSection: sectionType, bookId: book.id }), cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Save failed (${response.status})`)
            onAdded(payload.entry)
            setOpen(false); setQuery(''); setResults([])
            toast({ title: 'Book added', description: `“${book.title}” added to ${title}.` })
        } catch (error) {
            toast({ title: 'Could not add book', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })
        } finally { setSaving(false) }
    }

    async function removeBook(entryId: number) {
        try {
            const response = await fetch('/api/homepage_sections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId }) })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Delete failed (${response.status})`)
            onRemoved(entryId)
        } catch (error) {
            toast({ title: 'Could not remove book', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })
        }
    }

    return <section className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">Select up to {maxBooks} books ({entries.length}/{maxBooks})</p>
        <Button type="button" className="mt-4" disabled={entries.length >= maxBooks} onClick={() => setOpen(true)}>Add book</Button>
        <div className="mt-4 space-y-2">{entries.map((entry) => <div key={entry.entryId} className="flex items-center justify-between rounded-lg border p-4"><div><div className="font-medium">{entry.title ?? 'Book no longer available'}</div><div className="text-sm text-gray-500">{entry.author ?? ''}</div></div><Button type="button" variant="ghost" size="icon" onClick={() => void removeBook(entry.entryId)}><X className="h-4 w-4" /></Button></div>)}</div>
        <Picker open={open} title={title} query={query} results={results} searching={searching} saving={saving} onClose={() => { setOpen(false); setQuery(''); setResults([]) }} onQuery={search} onSelect={(book) => void selectBook(book)} />
    </section>
}

export default function HomeSection() {
    const [entries, setEntries] = React.useState<Entry[]>([])
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    React.useEffect(() => {
        fetch('/api/homepage_sections', { cache: 'no-store' }).then(async (response) => {
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Load failed (${response.status})`)
            setEntries(payload.sections || [])
        }).catch((error) => toast({ title: 'Could not load Home Section', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })).finally(() => setLoading(false))
    }, [toast])

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    return <div className="flex h-screen bg-gray-100"><AdminSidebar /><main className="flex-1 overflow-y-auto p-8"><BookSection title="Trending Books" sectionType="HOMEPAGE_TRENDING" entries={entries.filter((e) => e.pageSection === 'HOMEPAGE_TRENDING')} maxBooks={3} onAdded={(entry) => setEntries((current) => [...current, entry])} onRemoved={(id) => setEntries((current) => current.filter((e) => e.entryId !== id))} /><BookSection title="Books Collection" sectionType="HOMEPAGE_COLLECTION" entries={entries.filter((e) => e.pageSection === 'HOMEPAGE_COLLECTION')} maxBooks={4} onAdded={(entry) => setEntries((current) => [...current, entry])} onRemoved={(id) => setEntries((current) => current.filter((e) => e.entryId !== id))} /></main></div>
}
