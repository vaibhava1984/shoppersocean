import Link from "next/link"
import { Button } from "@/components/ui/button"

type Author = { author_id: string; name: string }

export default function AuthorsMenusLists({ initialAuthors = [], currentAuthor = "all", currentLanguage = "all" }: { initialAuthors?: Author[]; currentAuthor?: string; currentLanguage?: string }) {
    return (
        <div className="flex flex-col space-y-2">
            {initialAuthors.map((author) => {
                const params = new URLSearchParams()
                params.set('author', author.author_id)
                if (currentLanguage !== 'all') params.set('lang', currentLanguage)
                return (
                    <Button key={author.author_id} asChild variant={currentAuthor === author.author_id ? "default" : "ghost"} className="h-10 justify-start w-full rounded-lg px-4 font-sans text-sm font-semibold tracking-normal text-emerald-800 transition-colors hover:bg-emerald-50 hover:text-emerald-950">
                        <Link href={"/bookShelf?" + params.toString()} prefetch>{author.name}</Link>
                    </Button>
                )
            })}
        </div>
    )
}