"use client";

import { useCallback, useState } from "react";
import AuthModal from "@/components/AuthModal";

type YourBooksNavigationProps = {
  className: string;
};

export default function YourBooksNavigation({ className }: YourBooksNavigationProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const handleAuthenticated = useCallback(() => {
    setOpen(false);
    window.location.replace("/");
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Your Books
      </button>
      <AuthModal
        open={open}
        initialMode="signin"
        onClose={close}
        onSuccess={handleAuthenticated}
      />
    </>
  );
}
