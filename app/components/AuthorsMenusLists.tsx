"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

type Author = {
    author_id: string;
    name: string;
}

export default function AuthorsMenusLists() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [authorsMenuLists, setAuthorsMenuLists] = useState<Author[]>([])

    async function fetchAllAuthorsForMenu() {
        try {
            const { data, error } = await supabase.from('authors').select(`
                author_id,
                name
            `)
            if (error) throw error
            setAuthorsMenuLists([
                { author_id: 'all', name: 'All Authors' },
                ...(data || [])
            ])
        } catch (error) {
            console.error('Error fetching authors:', error)
        }
    }

    useEffect(() => {
        fetchAllAuthorsForMenu()
    }, [])

    const handleAuthorSelect = (authorId: string): void => {
        const params = new URLSearchParams(searchParams)

        // Handle author parameter
        if (authorId && authorId !== 'all') {
            params.set('author', authorId)
        } else {
            params.delete('author')
        }

        // Preserve language parameter if it exists
        const langParam = searchParams.get('lang')
        if (langParam) {
            params.set('lang', langParam)
        }

        router.push(`/bookShelf?${params.toString()}`)
    }

    const currentAuthorId = searchParams.get('author') || 'all'

    return (
        <div className="flex flex-col space-y-2">
            {authorsMenuLists.map((author) => (
                <Button
                    key={author.author_id}
                    variant={currentAuthorId === author.author_id ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleAuthorSelect(author.author_id)}
                >
                    {author.name}
                </Button>
            ))}
        </div>
    )
}