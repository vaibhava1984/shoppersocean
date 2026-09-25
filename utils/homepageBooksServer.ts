import { firestore } from '@/lib/firebase/admin'
import type { HomepageBookPlacement } from './homepageBooksCache'

export async function getHomepageBooksServer(): Promise<HomepageBookPlacement[]> {
  try {
    const layoutSnap = await firestore.collection('layout_settings').get()
    const layoutData = layoutSnap.docs
      .map(d => d.data() as any)
      .filter(item => item.page_section === 'HOMEPAGE_TRENDING' || item.page_section === 'HOMEPAGE_COLLECTION')
      .sort((a, b) => String(a.created_at ?? '').localeCompare(String(b.created_at ?? '')))

    const selectedIds = [...new Set(layoutData.map(item => String(item.value ?? '').trim()).filter(Boolean))]
    if (!selectedIds.length) return []

    const booksSnap = await firestore.collection('books').get()
    const selected = new Set(selectedIds)
    const booksById = new Map(
      booksSnap.docs
        .filter(d => selected.has(d.id) && d.data().is_deleted !== true)
        .map(d => {
          const book = d.data() as any
          return [d.id, {
            id: d.id,
            title: book.title ?? '',
            description: book.description ?? '',
            coverImage: Array.isArray(book.cover_images) ? book.cover_images[0] : book.cover_image,
            images: Array.isArray(book.cover_images) ? book.cover_images : undefined,
            author: book.author_name ?? book.author ?? '',
            price: Number(book.price ?? 0),
          }]
        })
    )

    return layoutData
      .map(item => {
        const book = booksById.get(String(item.value ?? '').trim())
        return book ? { ...book, pageSection: item.page_section } : null
      })
      .filter((book): book is HomepageBookPlacement => Boolean(book))
  } catch {
    return []
  }
}
