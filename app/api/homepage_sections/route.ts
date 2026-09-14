import { createAdminClient } from "@/utils/supabase/server_admin";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server'

const SECTION_TYPES = ['HOMEPAGE_TRENDING', 'HOMEPAGE_COLLECTION', 'HS'] as const
type SectionType = (typeof SECTION_TYPES)[number]

function isSectionType(value: unknown): value is SectionType {
    return typeof value === 'string' && SECTION_TYPES.includes(value as SectionType)
}

async function getAdminClient() {
    const {
        data: { user },
    } = await createClient().auth.getUser();
    return { supabase: createAdminClient(), isAdmin: user?.app_metadata?.userrole === "ADMIN" }
}

export async function GET() {
    try {
        const { supabase, isAdmin } = await getAdminClient()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        const { data: layoutData, error: layoutError } = await supabase
            .from('layout_settings')
            .select('id, page_section, value')
            .order('id', { ascending: true })

        if (layoutError) {
            console.error('Error fetching layout settings:', layoutError)
            return NextResponse.json({ error: 'Failed to fetch layout settings' }, { status: 500 })
        }

        const bookIds = (layoutData ?? []).map(item => item.value)

        const { data: booksData, error: booksError } = bookIds.length
            ? await supabase
                .from('books')
                .select('id, title, author_name, is_deleted')
                .in('id', bookIds)
            : { data: [], error: null }

        if (booksError) {
            console.error('Error fetching books:', booksError)
            return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
        }

        const booksById = new Map((booksData ?? []).map(book => [book.id, book]))

        const sections = (layoutData ?? []).map(item => {
            const book = booksById.get(item.value)
            return {
                entryId: item.id,
                pageSection: item.page_section,
                id: item.value,
                title: book?.title ?? null,
                author: book?.author_name ?? null,
                missing: !book || book.is_deleted === true,
            }
        })

        return NextResponse.json({ sections }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, isAdmin } = await getAdminClient()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        const { pageSection, bookId } = await request.json()
        if (!isSectionType(pageSection) || !bookId) {
            return NextResponse.json({ error: 'Invalid section or book' }, { status: 400 })
        }

        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('id, title, author_name')
            .eq('id', bookId)
            .maybeSingle()

        if (bookError) {
            console.error('Error looking up book:', bookError)
            return NextResponse.json({ error: 'Failed to look up book' }, { status: 500 })
        }
        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 })
        }

        const { data: existing, error: existingError } = await supabase
            .from('layout_settings')
            .select('id')
            .match({ page_section: pageSection, value: bookId })

        if (existingError) {
            console.error('Error checking existing selection:', existingError)
            return NextResponse.json({ error: 'Failed to save selection' }, { status: 500 })
        }
        if (existing && existing.length > 0) {
            return NextResponse.json({ error: 'Book is already in this section' }, { status: 409 })
        }

        const { data: inserted, error: insertError } = await supabase
            .from('layout_settings')
            .insert({ page_section: pageSection, value: bookId })
            .select('id')
            .single()

        if (insertError) {
            console.error('Error saving book selection:', insertError)
            return NextResponse.json({ error: 'Failed to save selection' }, { status: 500 })
        }

        return NextResponse.json(
            {
                entry: {
                    entryId: inserted.id,
                    pageSection,
                    id: book.id,
                    title: book.title,
                    author: book.author_name,
                    missing: false,
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { supabase, isAdmin } = await getAdminClient()
        if (!isAdmin) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        const { entryId } = await request.json()
        if (!entryId) {
            return NextResponse.json({ error: 'Missing entry id' }, { status: 400 })
        }

        const { error: deleteError } = await supabase
            .from('layout_settings')
            .delete()
            .eq('id', entryId)

        if (deleteError) {
            console.error('Error removing book from section:', deleteError)
            return NextResponse.json({ error: 'Failed to remove book' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Book removed successfully' }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
