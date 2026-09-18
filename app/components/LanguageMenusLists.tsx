"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type Language = {
    id: string;
    name: string;
    param: string | undefined;
}

const LanguageMenusList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const languages: Language[] = [
        { id: 'all', name: 'All Languages', param: undefined },
        { id: 'en', name: 'English', param: 'en' },
        { id: 'hindi', name: 'Hindi', param: 'hindi' }
    ]

    const handleLanguageSelect = (languageParam: string | undefined): void => {
        const params = new URLSearchParams(searchParams)

        if (languageParam) {
            params.set('lang', languageParam)
        } else {
            params.delete('lang')
        }

        const authorParam = searchParams.get('author')
        if (authorParam) {
            params.set('author', authorParam)
        }

        router.push(`/bookShelf?${params.toString()}`)
    }

    const currentLang = searchParams.get('lang') || 'all'

    return (
        <div className="flex flex-col space-y-2">
            {languages.map((language) => (
                <Button
                    key={language.id}
                    variant={currentLang === language.id ? "default" : "ghost"}
                    className="h-11 justify-start rounded-lg px-4 font-sans text-base font-bold tracking-wide text-indigo-800 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-950"
                    onClick={() => handleLanguageSelect(language.param)}
                >
                    {language.name}
                </Button>
            ))}
        </div>
    )
}

export default LanguageMenusList