"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

type YourBooksNavigationProps = {
  className: string;
};

export default function YourBooksNavigation({ className }: YourBooksNavigationProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const close = useCallback(() => setOpen(false), []);

  const handleAuthenticated = useCallback(() => {
    setOpen(false);
    router.push("/bookShelf");
  }, [router]);

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
