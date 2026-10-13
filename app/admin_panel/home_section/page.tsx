'use client'

import * as React from 'react'
import { X, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminSidebar from '../adminSidebar'
import { useToast } from '@/hooks/use-toast'

type Book = { id: string; title: string; author: string }
type Entry = { entryId: number; pageSection: string; id: string; title: string | null; author: string | null; missing: boolean }
type SectionType = 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION'

function Picker({ open, title, query, results, searching, saving, message, onClose, onQuery, onSelect }: {
    open: boolean; title: string; query: string; results: Book[]; searching: boolean; saving: boolean; message: string
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
            {message && <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
            <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
                {searching ? <p className="py-4 text-sm text-muted-foreground">Searching...</p> : query.trim().length >= 2 && results.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No books found.</p> : results.map((book) => <button key={book.id} type="button" disabled={saving} className="block min-h-14 w-full rounded-md border bg-white px-4 py-3 text-left touch-manipulation hover:bg-gray-50 disabled:opacity-50" onPointerUp={() => { if (!saving) onSelect(book) }} onClick={(event) => event.preventDefault()}><div className="font-medium">{book.title}</div><div className="text-sm text-muted-foreground">{book.author || 'Unknown author'}</div></button>)}
            </div>
        </div>
    </div>
}

function BookSection({ title, sectionType, entries, maxBooks, onAdded, onRemoved, onMove }: {
    title: string; sectionType: SectionType; entries: Entry[]; maxBooks: number
    onAdded: (entry: Entry) => void; onRemoved: (id: number) => void
    onMove: (entryId: number, direction: 'up' | 'down') => void
}) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<Book[]>([])
    const [searching, setSearching] = React.useState(false)
    const [saving, setSaving] = React.useState(false)
    const [message, setMessage] = React.useState('')
    const { toast } = useToast()

    async function search(value: string) {
        setQuery(value)
        setMessage('')
        if (value.trim().length < 2) { setResults([]); return }
        setSearching(true)
        try {
            const response = await fetch(`/api/homepage_sections?search=${encodeURIComponent(value.trim())}`, { cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Search failed (${response.status})`)
            setResults(payload.books || [])
        } catch (error) {
            setResults([])
            const text = error instanceof Error ? error.message : 'Please try again.'
            setMessage(text)
            toast({ title: 'Search failed', description: text, variant: 'destructive' })
        } finally { setSearching(false) }
    }

    async function selectBook(book: Book) {
        if (saving || entries.length >= maxBooks || entries.some((e) => e.id === book.id)) return
        setSaving(true)
        setMessage(`Saving “${book.title}”…`)
        try {
            const response = await fetch('/api/homepage_sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageSection: sectionType, bookId: book.id }), cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Save failed (${response.status})`)
            onAdded(payload.entry)
            setOpen(false); setQuery(''); setResults([]); setMessage('')
            toast({ title: 'Book added', description: `“${book.title}” added to ${title}.` })
        } catch (error) {
            const text = error instanceof Error ? error.message : 'Please try again.'
            setMessage(`Could not add book: ${text}`)
            toast({ title: 'Could not add book', description: text, variant: 'destructive' })
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
        <p className="mt-1 text-sm text-gray-500">Select up to {maxBooks} books ({entries.length}/{maxBooks}). Use the arrows to set homepage priority.</p>
        <Button type="button" className="mt-4" disabled={entries.length >= maxBooks} onClick={() => { setMessage(''); setOpen(true) }}>Add book</Button>
        <div className="mt-4 space-y-2">{entries.map((entry, index) => <div key={entry.entryId} className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{index + 1}</span><div className="min-w-0"><div className="font-medium">{entry.title ?? 'Book no longer available'}</div><div className="text-sm text-gray-500">{entry.author ?? ''}</div></div></div><div className="flex shrink-0 items-center gap-1"><Button type="button" variant="outline" size="icon" aria-label={`Move ${entry.title ?? 'book'} up`} disabled={index === 0} onClick={() => onMove(entry.entryId, 'up')}><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" aria-label={`Move ${entry.title ?? 'book'} down`} disabled={index === entries.length - 1} onClick={() => onMove(entry.entryId, 'down')}><ArrowDown className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${entry.title ?? 'book'}`} onClick={() => void removeBook(entry.entryId)}><X className="h-4 w-4" /></Button></div></div>)}</div>
        <Picker open={open} title={title} query={query} results={results} searching={searching} saving={saving} message={message} onClose={() => { setOpen(false); setQuery(''); setResults([]); setMessage('') }} onQuery={search} onSelect={(book) => void selectBook(book)} />
    </section>
}

export default function HomeSection() {
    const [entries, setEntries] = React.useState<Entry[]>([])
    const [loading, setLoading] = React.useState(true)
    const [moving, setMoving] = React.useState(false)
    const { toast } = useToast()

    const loadEntries = React.useCallback(async () => {
        const response = await fetch('/api/homepage_sections', { cache: 'no-store' })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || `Load failed (${response.status})`)
        setEntries(payload.sections || [])
    }, [])

    React.useEffect(() => {
        loadEntries().catch((error) => toast({ title: 'Could not load Home Section', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })).finally(() => setLoading(false))
    }, [loadEntries, toast])

    async function moveEntry(entryId: number, direction: 'up' | 'down') {
        if (moving) return
        setMoving(true)
        try {
            const response = await fetch('/api/homepage_sections', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId, direction }), cache: 'no-store' })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Could not change priority')
            await loadEntries()
        } catch (error) {
            toast({ title: 'Could not change priority', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' })
        } finally { setMoving(false) }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    return <div className="flex h-screen bg-gray-100"><AdminSidebar /><main className="flex-1 overflow-y-auto p-4 sm:p-8"><BookSection title="Trending Books" sectionType="HOMEPAGE_TRENDING" entries={entries.filter((e) => e.pageSection === 'HOMEPAGE_TRENDING')} maxBooks={8} onAdded={(entry) => setEntries((current) => [...current, entry])} onRemoved={(id) => setEntries((current) => current.filter((e) => e.entryId !== id))} onMove={moveEntry} /><BookSection title="Books in International Languages" sectionType="HOMEPAGE_COLLECTION" entries={entries.filter((e) => e.pageSection === 'HOMEPAGE_COLLECTION')} maxBooks={8} onAdded={(entry) => setEntries((current) => [...current, entry])} onRemoved={(id) => setEntries((current) => current.filter((e) => e.entryId !== id))} onMove={moveEntry} /></main></div>
}
