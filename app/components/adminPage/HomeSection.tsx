'use client'

import * as React from 'react'
import { X, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Book = { id: string; title: string; author: string }
type Entry = { entryId: number; pageSection: string; id: string; title: string | null; author: string | null }
type SectionType = 'HOMEPAGE_TRENDING' | 'HOMEPAGE_COLLECTION'

function BookSection({ title, sectionType, entries, onReload, onLocalChange }: {
  title: string; sectionType: SectionType; entries: Entry[]; onReload: () => Promise<void>; onLocalChange: (fn: (items: Entry[]) => Entry[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Book[]>([])
  const [searching, setSearching] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [moving, setMoving] = React.useState(false)
  const maxBooks = 8

  async function search(value: string) {
    setQuery(value); setMessage('')
    if (value.trim().length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const response = await fetch('/api/homepage_sections?search=' + encodeURIComponent(value.trim()), { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Search failed')
      setResults(payload.books || [])
    } catch (error) {
      setResults([])
      setMessage(error instanceof Error ? error.message : 'Search failed. Please try again.')
    } finally { setSearching(false) }
  }

  async function addBook(book: Book) {
    if (saving || entries.length >= maxBooks || entries.some(item => item.id === book.id)) return
    setSaving(true); setMessage('Saving book…')
    try {
      const response = await fetch('/api/homepage_sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageSection: sectionType, bookId: book.id }), cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not save book')
      await onReload(); setOpen(false); setQuery(''); setResults([]); setMessage('')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save book') }
    finally { setSaving(false) }
  }

  async function removeBook(entryId: number) {
    try {
      const response = await fetch('/api/homepage_sections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId }), cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not remove book')
      onLocalChange(items => items.filter(item => item.entryId !== entryId))
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove book') }
  }

  async function moveBook(entryId: number, direction: 'up' | 'down') {
    if (moving) return
    setMoving(true)
    try {
      const response = await fetch('/api/homepage_sections', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId, direction }), cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not change priority')
      await onReload()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not change priority') }
    finally { setMoving(false) }
  }

  return <Card className="mb-8">
    <CardHeader><CardTitle>{title}</CardTitle><CardDescription>Select up to 8 books ({entries.length}/8). Use the arrows to set homepage priority.</CardDescription></CardHeader>
    <CardContent>
      <Button type="button" disabled={entries.length >= maxBooks} onClick={() => { setMessage(''); setOpen(true) }} className="mb-4">Add book</Button>
      {message && <p role="status" className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <div className="space-y-2">{entries.map((entry, index) => <div key={entry.entryId} className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">{index + 1}</span><div className="min-w-0"><div className="font-medium">{entry.title || 'Book no longer available'}</div><div className="text-sm text-muted-foreground">{entry.author || ''}</div></div></div>
        <div className="flex shrink-0 items-center gap-1"><Button type="button" variant="outline" size="icon" aria-label="Move book up" disabled={index === 0 || moving} onClick={() => void moveBook(entry.entryId, 'up')}><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" aria-label="Move book down" disabled={index === entries.length - 1 || moving} onClick={() => void moveBook(entry.entryId, 'down')}><ArrowDown className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" aria-label="Remove book" onClick={() => void removeBook(entry.entryId)}><X className="h-4 w-4" /></Button></div>
      </div>)}</div>
      {open && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4" onClick={() => setOpen(false)}><div className="mx-auto mt-8 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" onClick={event => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Search Books</h3><button type="button" aria-label="Close" className="rounded-md p-2 hover:bg-gray-100" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
        <Input autoFocus placeholder="Search by title or author..." value={query} onChange={event => void search(event.target.value)} />
        <p className="mt-2 text-xs text-muted-foreground">Adding to: {title}</p>
        {message && <p role="status" className="mt-3 text-sm text-red-700">{message}</p>}
        <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">{searching ? <p className="py-4 text-sm">Searching…</p> : query.trim().length >= 2 && results.length === 0 ? <p className="py-4 text-sm">No books found.</p> : results.map(book => <button key={book.id} type="button" disabled={saving || entries.some(item => item.id === book.id)} className="block min-h-14 w-full rounded-md border bg-white px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50" onClick={() => void addBook(book)}><div className="font-medium">{book.title}</div><div className="text-sm text-muted-foreground">{book.author || 'Unknown author'}</div></button>)}</div>
      </div></div>}
    </CardContent>
  </Card>
}

export default function HomeSection() {
  const [entries, setEntries] = React.useState<Entry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const reload = React.useCallback(async () => {
    const response = await fetch('/api/homepage_sections', { cache: 'no-store' })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Could not load homepage books')
    setEntries(payload.sections || [])
    setError('')
  }, [])
  React.useEffect(() => { reload().catch(error => setError(error instanceof Error ? error.message : 'Could not load homepage books')).finally(() => setLoading(false)) }, [reload])
  if (loading) return <div className="p-6">Loading homepage books…</div>
  if (error && entries.length === 0) return <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">Could not load homepage books: {error} <Button type="button" variant="outline" className="ml-2" onClick={() => { setLoading(true); reload().catch(e => setError(e instanceof Error ? e.message : 'Could not load')).finally(() => setLoading(false)) }}>Retry</Button></div>
  return <div className="space-y-8">
    <BookSection title="Trending Books" sectionType="HOMEPAGE_TRENDING" entries={entries.filter(item => item.pageSection === 'HOMEPAGE_TRENDING')} onReload={reload} onLocalChange={update => setEntries(update)} />
    <BookSection title="Books in International Languages" sectionType="HOMEPAGE_COLLECTION" entries={entries.filter(item => item.pageSection === 'HOMEPAGE_COLLECTION')} onReload={reload} onLocalChange={update => setEntries(update)} />
  </div>
}
