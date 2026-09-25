import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase/admin'
import { getFirebaseUser } from '@/lib/firebase/session'

const SECTION_TYPES = ['HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION', 'HS'] as const
type SectionType = (typeof SECTION_TYPES)[number]

function isSectionType(value: unknown): value is SectionType {
  return typeof value === 'string' && SECTION_TYPES.includes(value as SectionType)
}

async function getAdmin() {
  const user = await getFirebaseUser()
  if (!user) return null
  let role = (user as any).userrole || (user as any).role
  if (role !== 'ADMIN') {
    const profile = await firestore.collection('profiles').doc(user.uid).get()
    role = profile.exists ? profile.data()?.userrole : role
  }
  return role === 'ADMIN' ? user : null
}

function bookData(id: string, data: any) {
  return { id, title: data.title ?? '', author: data.author_name ?? data.author ?? '', is_deleted: data.is_deleted === true }
}

export async function GET(request: Request) {
  try {
    if (!(await getAdmin())) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    const search = new URL(request.url).searchParams.get('search')?.trim().toLowerCase() ?? ''

    if (search.length >= 2) {
      const snap = await firestore.collection('books').get()
      const books = snap.docs
        .map(d => bookData(d.id, d.data()))
        .filter(b => !b.is_deleted && (`${b.title} ${b.author}`.toLowerCase().includes(search)))
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 15)
      return NextResponse.json({ books })
    }

    const layoutSnap = await firestore.collection('layout_settings').orderBy('id').get().catch(() => firestore.collection('layout_settings').get())
    const layoutData = layoutSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    const bookIds = [...new Set(layoutData.map(item => String(item.value ?? '').trim()).filter(Boolean))]
    const booksSnap = bookIds.length ? await firestore.collection('books').get() : null
    const booksById = new Map((booksSnap?.docs ?? []).map(d => [d.id, bookData(d.id, d.data())]))
    const sections = layoutData.map(item => {
      const book = booksById.get(String(item.value ?? '').trim())
      return { entryId: item.id, pageSection: item.page_section, id: item.value, title: book?.title ?? null, author: book?.author ?? null, missing: !book || book.is_deleted }
    })
    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getAdmin())) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    const { pageSection, bookId } = await request.json()
    if (!isSectionType(pageSection) || !bookId) return NextResponse.json({ error: 'Invalid section or book' }, { status: 400 })

    const bookSnap = await firestore.collection('books').doc(String(bookId)).get()
    if (!bookSnap.exists) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    const book = bookData(bookSnap.id, bookSnap.data())
    if (book.is_deleted) return NextResponse.json({ error: 'This book has been deleted' }, { status: 400 })

    const existingSnap = await firestore.collection('layout_settings').where('page_section', '==', pageSection).where('value', '==', String(bookId)).get()
    if (!existingSnap.empty) return NextResponse.json({ error: 'Book is already in this section' }, { status: 409 })

    const maxBooks = pageSection === 'HOMEPAGE_TRENDING' ? 3 : pageSection === 'HOMEPAGE_COLLECTION' ? 4 : null
    if (maxBooks !== null) {
      const sectionEntries = await firestore.collection('layout_settings').where('page_section', '==', pageSection).get()
      if (sectionEntries.size >= maxBooks) return NextResponse.json({ error: `This section is full. Maximum ${maxBooks} books allowed.` }, { status: 409 })
    }

    const ref = firestore.collection('layout_settings').doc()
    await ref.set({ page_section: pageSection, value: String(bookId), id: ref.id, created_at: new Date().toISOString() })
    return NextResponse.json({ entry: { entryId: ref.id, pageSection, id: book.id, title: book.title, author: book.author, missing: false } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await getAdmin())) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    const { entryId } = await request.json()
    if (!entryId) return NextResponse.json({ error: 'Missing entry id' }, { status: 400 })
    await firestore.collection('layout_settings').doc(String(entryId)).delete()
    return NextResponse.json({ message: 'Book removed successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
