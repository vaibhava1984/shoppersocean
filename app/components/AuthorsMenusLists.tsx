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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function fetchAllAuthorsForMenu() {
        try {
            setIsLoading(true)
            setError(null)
            
            const { data, error: fetchError } = await supabase
                .from('authors')
                .select('author_id,name')
                .eq('is_deleted', false)
                .order('name', { ascending: true }) // Add ordering for consistency
            
            if (fetchError) throw fetchError
            
            setAuthorsMenuLists([
                { author_id: 'all', name: 'All Authors' },
                ...(data || [])
            ])
        } catch (err) {
            console.error('Error fetching authors:', err)
            setError('Failed to load authors')
            // Fallback to at least show "All Authors"
            setAuthorsMenuLists([{ author_id: 'all', name: 'All Authors' }])
        } finally {
            setIsLoading(false)
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

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-500 text-sm">
                {error}
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-2">
            {authorsMenuLists.map((author) => (
                <Button
                    key={author.author_id}
                    variant={currentAuthorId === author.author_id ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => handleAuthorSelect(author.author_id)}
                    disabled={isLoading}
                >
                    {author.name}
                </Button>
            ))}
        </div>
    )
}
