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
        // Read the admin-selected placements first. These rows are public-readable.
        const { data: layoutData, error: layoutError } = await supabase
            .from('layout_settings')
               .select('page_section, value')
            .in('page_section', ['HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION'])
            .order('id', { ascending: true })

        if (layoutError) throw layoutError
        if (!layoutData?.length) return []

        const selectedIds = new Set(
            layoutData
                .map(item => String(item.value ?? '').trim())
                .filter(Boolean)
        )

        if (!selectedIds.size) return []

        // Fetch the small books table directly instead of relying on a UUID .in()
        // filter. This keeps the public homepage resilient if the layout value
        // column changes type or contains UUID strings in a different representation.
        const { data: booksData, error: booksError } = await supabase
            .from('books')
            .select('id, title, description, cover_images, author_name, price, is_deleted')
            .eq('is_deleted', false)

        if (booksError) throw booksError

        const booksById = new Map(
            (booksData ?? []).map(book => [String(book.id), {
                id: String(book.id),
                title: book.title,
                description: book.description ?? '',
                coverImage: Array.isArray(book.cover_images) ? book.cover_images[0] : undefined,
                images: Array.isArray(book.cover_images) ? book.cover_images : undefined,
                author: book.author_name,
                price: Number(book.price ?? 0),
            }])
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
