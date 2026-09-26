import { createClient } from '@/utils/db/server'
import type { HomepageBookPlacement } from './homepageBooksCache'

export async function getHomepageBooksServer(): Promise<HomepageBookPlacement[]> {
  const supabase = createClient()
  const { data: layoutData, error: layoutError } = await supabase.from('layout_settings').select('page_section, value').in('page_section', ['HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION']).order('id', { ascending: true })
  if (layoutError || !layoutData?.length) return []
  const selectedIds = [...new Set(layoutData.map(item => String(item.value ?? '').trim()).filter(Boolean))]
  if (!selectedIds.length) return []
  const { data: booksData, error: booksError } = await supabase.from('books').select('id, title, description, cover_images, author_name, price').eq('is_deleted', false).in('id', selectedIds)
  if (booksError) return []
  const booksById = new Map((booksData ?? []).map(book => [String(book.id), { id: String(book.id), title: book.title, description: book.description ?? '', coverImage: Array.isArray(book.cover_images) ? book.cover_images[0] : undefined, images: Array.isArray(book.cover_images) ? book.cover_images : undefined, author: book.author_name, price: Number(book.price ?? 0) }]))
  return layoutData.map(item => { const book = booksById.get(String(item.value ?? '').trim()); return book ? { ...book, pageSection: item.page_section } : null }).filter((book): book is HomepageBookPlacement => Boolean(book))
}
