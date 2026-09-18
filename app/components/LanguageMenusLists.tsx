import Link from "next/link"
import { Button } from "@/components/ui/button"

type Language = { id: string; name: string; param: string }
const languages: Language[] = [
    { id: 'en', name: 'English', param: 'en' },
    { id: 'hindi', name: 'Hindi', param: 'hindi' },
]

export default function LanguageMenusLists({ currentLang = "all", currentAuthor = "all" }: { currentLang?: string; currentAuthor?: string }) {
    return (
        <div className="flex flex-col space-y-2">
            {languages.map((language) => {
                const params = new URLSearchParams()
                params.set('lang', language.param)
                if (currentAuthor !== 'all') params.set('author', currentAuthor)
                return (
                    <Button key={language.id} asChild variant={currentLang === language.id ? "default" : "ghost"} className="h-10 justify-start rounded-lg px-4 font-sans text-sm font-semibold tracking-normal text-emerald-800 transition-colors hover:bg-emerald-50 hover:text-emerald-950">
                        <Link href={"/bookShelf?" + params.toString()} prefetch>{language.name}</Link>
                    </Button>
                )
            })}
        </div>
    )
}