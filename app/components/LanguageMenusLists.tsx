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
                    <Button key={language.id} asChild variant={currentLang === language.id ? "default" : "ghost"} className="h-11 justify-start rounded-lg px-4 font-sans text-base font-bold tracking-normal text-green-700 transition-colors hover:bg-green-50 hover:text-green-800">
                        <Link href={"/bookShelf?" + params.toString()}>{language.name}</Link>
                    </Button>
                )
            })}
        </div>
    )
}