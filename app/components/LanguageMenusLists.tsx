"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type Language = {
    id: string;
    name: string;
    param: string;
}

const LanguageMenusList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const languages: Language[] = [
        { id: 'en', name: 'English', param: 'en' },
        { id: 'hindi', name: 'Hindi', param: 'hindi' }
    ]

    const handleLanguageSelect = (languageParam: string): void => {
        const params = new URLSearchParams(searchParams)
        params.set('lang', languageParam)

        const authorParam = searchParams.get('author')
        if (authorParam) {
            params.set('author', authorParam)
        }

        router.push(`/bookShelf?${params.toString()}`)
    }

    const currentLang = searchParams.get('lang')

    return (
        <div className="flex flex-col space-y-2">
            {languages.map((language) => (
                <Button
                    key={language.id}
                    variant={currentLang === language.id ? "default" : "ghost"}
                    className="h-10 justify-start rounded-lg px-4 font-sans text-sm font-semibold tracking-normal text-emerald-800 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-950"
                    onClick={() => handleLanguageSelect(language.param)}
                >
                    {language.name}
                </Button>
            ))}
        </div>
    )
}

export default LanguageMenusList