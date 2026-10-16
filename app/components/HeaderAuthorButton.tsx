'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeaderAuthorButton() {
  return (
    <Link href="/create-your-flipbook" className="inline-flex">
      <Button
        type="button"
        className="relative z-50 pointer-events-auto cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
      >
        Create Your Flipbook
      </Button>
    </Link>
  )
}
