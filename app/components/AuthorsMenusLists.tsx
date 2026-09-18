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
                .order('name', { ascending: true })
            
            if (fetchError) throw fetchError
            
            setAuthorsMenuLists([
                { author_id: 'all', name: 'All Authors' },
                ...(data || [])
            ])
        } catch (err) {
            console.error('Error fetching authors:', err)
            setError('Failed to load authors')
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

        if (authorId && authorId !== 'all') {
            params.set('author', authorId)
        } else {
            params.delete('author')
        }

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
                    className="h-11 justify-start w-full rounded-lg px-4 font-sans text-sm font-bold tracking-normal text-rose-800 transition-all duration-200 hover:bg-rose-50 hover:text-rose-950"
                    onClick={() => handleAuthorSelect(author.author_id)}
                    disabled={isLoading}
                >
                    {author.name}
                </Button>
            ))}
        </div>
    )
}
