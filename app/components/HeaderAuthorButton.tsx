'use client'

import Link from 'next/link'

export default function HeaderAuthorButton() {
  return (
    <Link
      href="/create-your-flipbook"
      className="relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center"
    >
      Create Your Flipbook
    </Link>
  )
}
