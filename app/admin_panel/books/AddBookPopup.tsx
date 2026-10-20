import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookType } from "@/types/Books.type"
import { useToast } from "@/hooks/use-toast"
import { SUPPORTED_BOOK_LANGUAGES } from "@/utils/languages"
import { SUPPORTED_BOOK_GENRES } from "@/utils/book-genres"

interface Author {
    author_id: string;
    name: string;
}

interface BookFile {
    id: string;
    file_path: string;
    file_name: string;
    file_type: string;
}

// Convert ISO dates to DD-MM-YYYY for the admin interface; keep ISO in storage.
function dateToDisplay(value: unknown): string {
    const date = String(value ?? "").trim();
    const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
    return date;
}

function dateToStorage(value: unknown): string {
    const date = String(value ?? "").trim();
    const display = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (display) return `${display[3]}-${display[2]}-${display[1]}`;
    return date;
}

type propsType = {
    book?: BookType,
    onSuccess: (closePopup: boolean) => void,
}

export default function AddBookPopup(props: propsType) {
    const { toast } = useToast();
    const { book } = props;
    const [authors, setAuthors] = useState<Author[]>([]);
    const [bookFiles, setBookFiles] = useState<BookFile[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingBookDetails, setIsLoadingBookDetails] = useState(Boolean(book?.id));
    const [pendingBookFiles, setPendingBookFiles] = useState<File[]>([]);
    // Retain the newly created book ID if its PDF upload fails, so retrying Save
    // uploads the selected PDF without creating a duplicate book record.
    const [pendingSavedBookId, setPendingSavedBookId] = useState<string | null>(null);
    const bookFileInputRef = useRef<HTMLInputElement>(null);

  