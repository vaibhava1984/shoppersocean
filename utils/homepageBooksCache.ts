import { createClient } from '@/utils/supabase/client'

export type HomepageBook = {
    id: string
    title: string
    description: string
    coverImage?: string
    images?: string[]
    author?: string
    price: number
}

export type HomepageBookPlacement = HomepageBook & {
    pageSection: string
}

let homepageBooksPromise: Promise<HomepageBookPlacement[]> | null = null

export function getHomepageBooks(): Promise<HomepageBookPlacement[]> {
    if (homepageBooksPromise) return homepageBooksPromise

    const supabase = createClient()

    homepageBooksPromise = (async () => {
        const { data: layoutData, error: layoutError } = await supabase
            .from('layout_settings')
            .select('page_section, value')
            .in('page_section', ['HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION'])
            .order('id', { ascending: true })

        if (layoutError) throw layoutError
        if (!layoutData?.length) return []

        const selectedIds = [
            ...new Set(
                layoutData
                    .map(item => String(item.value ?? '').trim())
                    .filter(Boolean)
            ),
        ]

        if (!selectedIds.length) return []

        const { data: booksData, error: booksError } = await supabase
            .from('books')
            .select('id, title, description, cover_images, author_name, price')
            .eq('is_deleted', false)
            .in('id', selectedIds)

        if (booksError) throw booksError

        const booksById = new Map(
            (booksData ?? []).map(book => [
                String(book.id),
                {
                    id: String(book.id),
                    title: book.title,
                    description: book.description ?? '',
                    coverImage: Array.isArray(book.cover_images) ? book.cover_images[0] : undefined,
                    images: Array.isArray(book.cover_images) ? book.cover_images : undefined,
                    author: book.author_name,
                    price: Number(book.price ?? 0),
                },
            ])
        )

        return layoutData
            .map(item => {
                const book = booksById.get(String(item.value ?? '').trim())
                return book ? { ...book, pageSection: item.page_section } : null
            })
            .filter((book): book is HomepageBookPlacement => Boolean(book))
    })().catch(error => {
        homepageBooksPromise = null
        throw error
    })

    return homepageBooksPromise
}
