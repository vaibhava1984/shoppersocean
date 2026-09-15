'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ContactForm from './ContactForm'

export default function HeaderAuthorButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="relative z-50 pointer-events-auto cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/30 text-white font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-white/20 hover:border-white/50 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
      >
        Are you an author?
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white overflow-y-auto max-h-[85%]">
          <DialogHeader>
            <DialogTitle className="hidden">Are you an Author?</DialogTitle>
          </DialogHeader>
          <ContactForm
            title="Are you an Author?"
            hideDescription
            successMessage="Thank you for your interest"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
