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
            .order('id', { ascending: true })

        if (layoutError) throw layoutError
        if (!layoutData?.length) return []

        const bookIds = [...new Set(layoutData.map(item => item.value).filter(Boolean))]

        const { data: booksData, error: booksError } = await supabase
            .from('books')
            .select('id, title, description, cover_images, author_name, price, is_deleted')
            .in('id', bookIds)
            .eq('is_deleted', false)

        if (booksError) throw booksError

        const booksById = new Map(
            (booksData ?? []).map(book => [book.id, {
                id: book.id,
                title: book.title,
                description: book.description ?? '',
                coverImage: book.cover_images?.[0],
                images: book.cover_images,
                author: book.author_name,
                price: book.price,
            }])
        )

        return layoutData
            .map(item => {
                const book = booksById.get(item.value)
                return book ? { ...book, pageSection: item.page_section } : null
            })
            .filter((book): book is HomepageBookPlacement => Boolean(book))
    })().catch(error => {
        homepageBooksPromise = null
        throw error
    })

    return homepageBooksPromise
}
