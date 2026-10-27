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

// Reuse the author list between Add/Edit Book dialogs instead of fetching it
// again every time the admin opens another book.
let cachedAuthors: Author[] | null = null;
let authorsRequest: Promise<Author[]> | null = null;

function toDisplayDate(value: string) {
    if (!value) return '';
    const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function toStorageDate(value: string) {
    const match = value.match(/^(\\d{2})-(\\d{2})-(\\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
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

    const sortedAuthors = [...authors].sort((a, b) => a.name.localeCompare(b.name));
    const languageOptions = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...(book?.language ? [book.language] : [])])).sort((a, b) => a.localeCompare(b));

    const [formData, setFormData] = useState<Omit<BookType, 'id' | 'author_name' | 'updated_at'>>({
        title: book?.title ?? '',
        description: book?.description ?? '',
        published_date: toDisplayDate(book?.published_date ?? ''),
        isbn: book?.isbn ?? '',
        price: book?.price_inr ?? book?.price ?? 0,
        price_usd: 0,
        price_eur: 0,
        price_cny: 0,
        price_rub: 0,
        ratings: book?.ratings ?? 0,
        cover_images: book?.cover_images ?? [],
        binding: book?.binding ?? '',
        language: book?.language ?? 'English',
        genre: book?.genre ?? 'Suspense and Thriller',
        publisher: book?.publisher ?? '',
        pages: book?.pages ?? 0,
        author_id: book?.author_id ?? '',
    });

    const [authorName, setAuthorName] = useState(''); // State for author name

    useEffect(() => {
        fetchAuthors();
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function loadBookDetails() {
            if (!book?.id) {
                setIsLoadingBookDetails(false);
                return;
            }
            setIsLoadingBookDetails(true);
            try {
                const response = await fetch(`/api/admin/books?id=${encodeURIComponent(String(book.id))}`, { cache: "no-store" });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Failed to load book details");
                if (!cancelled) {
                    const details = result.book || {};
                    // The list endpoint intentionally omits cover-image payloads and may
                    // contain stale fields. Hydrate the editor from the authoritative
                    // single-book response so saved descriptions/summaries are restored.
                    setFormData((previous) => ({
                        ...previous,
                        ...details,
                        price: details.price_inr ?? details.price ?? previous.price,
                        price_usd: Number(details.price_usd ?? previous.price_usd ?? 0),
                        price_eur: Number(details.price_eur ?? previous.price_eur ?? 0),
                        price_cny: Number(details.price_cny ?? previous.price_cny ?? 0),
                        price_rub: Number(details.price_rub ?? previous.price_rub ?? 0),
                        cover_images: Array.isArray(details.cover_images) ? details.cover_images : previous.cover_images,
                    }));
                }
            } catch (error) {
                console.error("Error loading book cover details:", error);
            } finally {
                if (!cancelled) setIsLoadingBookDetails(false);
            }
        }
        loadBookDetails();
        return () => { cancelled = true; };
    }, [book?.id]);

    useEffect(() => {
        if (authors?.length && book && book?.author_id) {
            const filteredAuthorName = authors.filter((author) => author.author_id === book?.author_id)
            if (filteredAuthorName?.length) {
                setAuthorName(filteredAuthorName[0].name)
            }
        }
    }, [authors, book]);

    useEffect(() => {
        if (book?.id) {
            fetchBookFiles(book.id);
        }
    }, [book?.id]);

    async function fetchBookFiles(bookId: string) {
        try {
            const response = await fetch(`/api/admin/book-files?bookId=${encodeURIComponent(bookId)}`, { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to fetch book files");
            setBookFiles(result.files || []);
        } catch (error) { console.error("Error fetching book files:", error); }
    }

    // Handle book file uploads
    async function handleBookFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const selected = files[0];
        if (!selected.name.toLowerCase().endsWith('.pdf')) {
            toast({ variant: "destructive", title: "PDF files only", description: "Please choose a PDF book file." });
            event.target.value = '';
            return;
        }
        if (!book?.id) {
            setPendingBookFiles([selected]);
            toast({ title: "PDF selected", description: "The PDF will upload when you press Save." });
            event.target.value = '';
            return;
        }
        // Keep the selected file in state until the server confirms success.
        // If B2/D1 upload fails, the admin can retry without choosing the PDF again.
        setPendingBookFiles([selected]);
        const uploaded = await uploadBookFiles(book.id, [selected]);
        if (uploaded) setPendingBookFiles([]);
        event.target.value = '';
    }

    async function uploadBookFiles(bookId: string, files: File[]): Promise<boolean> {
        if (!files.length) return false;
        setIsUploading(true); setUploadProgress(0);
        try {
            const form = new FormData();
            form.append("bookId", bookId);
            form.append("file", files[0]);
            const response = await fetch("/api/admin/book-files", { method: "POST", body: form });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to upload files");
            setUploadProgress(100);
            await fetchBookFiles(bookId);
            toast({ title:"The new book uploaded", description:"The PDF is saved. If a previous PDF existed, it has been replaced." });
            window.parent.postMessage({ type: "admin-book-uploaded", key: "Books" }, window.location.origin);
            return true;
        } catch (error:any) {
            toast({ variant:"destructive", title:"PDF upload failed", description:error?.message || "Failed to upload files. Please retry Save." });
            return false;
        } finally { setIsUploading(false); }
    }

    async function fetchAuthors() {
        if (cachedAuthors) {
            setAuthors(cachedAuthors);
            return;
        }
        try {
            if (!authorsRequest) {
                authorsRequest = fetch("/api/admin/authors", { cache: "no-store" })
                    .then(async (response) => {
                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error || "Failed to fetch authors");
                        const list = Array.isArray(result.authors) ? result.authors : [];
                        cachedAuthors = list;
                        return list;
                    })
                    .finally(() => { authorsRequest = null; });
            }
            const list = await authorsRequest;
            setAuthors(list);
        } catch(error) {
            authorsRequest = null;
            console.error("Error fetching authors:", error);
        }
    }

    async function validateAndAddBook() {
        if (isSaving || isUploading) return;
        const validationErrors: Record<string, string> = {};
        if (!formData.title.trim()) validationErrors.title = 'Book title is required';
        if (!authorName || !formData.author_id) validationErrors.author = 'Please select an author';
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            toast({ variant: "destructive", title: "Please check the form", description: Object.values(validationErrors).join(". ") });
            window.parent.postMessage({ type: "admin-section-save-failed", key: "Books", message: "Please check the highlighted book details and prices." }, window.location.origin);
            return;
        }
        if (!formData.author_id) validationErrors.author = 'Author is required';
        // if (!formData.isbn) validationErrors.isbn = 'ISBN is required';
        if (!formData.price || !Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) validationErrors.price = 'Valid INR price is required';
        if (!formData.price_usd || !Number.isFinite(Number(formData.price_usd)) || Number(formData.price_usd) <= 0) validationErrors.price_usd = 'Valid USD price is required';
        if (!formData.price_eur || !Number.isFinite(Number(formData.price_eur)) || Number(formData.price_eur) <= 0) validationErrors.price_eur = 'Valid EUR price is required';
        if (!formData.price_cny || !Number.isFinite(Number(formData.price_cny)) || Number(formData.price_cny) <= 0) validationErrors.price_cny = 'Valid CNY price is required';
        if (!formData.price_rub || !Number.isFinite(Number(formData.price_rub)) || Number(formData.price_rub) <= 0) validationErrors.price_rub = 'Valid RUB price is required';
        if (!formData.pages || isNaN(Number(formData.pages))) validationErrors.pages = 'Valid flipbook pages number is required';
        if (Number(formData.pages) <= 50 && formData.genre !== 'Short Books') {
            validationErrors.pages = "Books with 50 pages or fewer must be submitted in the 'Short Books' genre.";
        } else if (Number(formData.pages) > 50 && formData.genre === 'Short Books') {
            validationErrors.pages = "Books with more than 50 pages must be submitted in a non-short-book genre.";
        }
        if (!formData.published_date) validationErrors.published_date = 'Published date is required';

        if (Object.keys(validationErrors).length === 0) {
            // const isbnExists = await checkIsbnExists(formData.isbn);
            // if (isbnExists && !book) {
            //     alert('ISBN already exists, please provide a correct ISBN number.');
            //     return;
            // }
            await addOrUpdateBook();
        } else {
            setErrors(validationErrors);
            toast({ variant: "destructive", title: "Please check the form", description: Object.values(validationErrors).join(". ") });
            window.parent.postMessage({ type: "admin-section-save-failed", key: "Books", message: "Please check the highlighted book details and prices." }, window.location.origin);
        }
    }

    async function checkIsbnExists(isbn: string) { return false; }

    async function addOrUpdateBook() {
        if (isSaving || isUploading) return;
        setIsSaving(true);
        try {
            let savedBookId = String(book?.id || pendingSavedBookId || "");

            // If the book record was already created but its PDF upload failed,
            // retry only the upload instead of creating a duplicate book.
            if (!pendingSavedBookId) {
                const payload:any = { ...formData, published_date: toStorageDate(formData.published_date), price_inr: formData.price, author_name: authorName, id: book?.id };
                const response=await fetch("/api/admin/books",{method:book?.id ? "PUT" : "POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
                const result=await response.json();
                if(!response.ok) throw new Error(result.error || "Something went wrong");
                savedBookId = String(result.id || book?.id || "");
                if (!book?.id && savedBookId) setPendingSavedBookId(savedBookId);
            }

            if (pendingBookFiles.length) {
                if (!savedBookId) throw new Error("Book details were saved, but the PDF could not be linked. Please retry Save.");
                const uploaded = await uploadBookFiles(savedBookId, pendingBookFiles);
                if (!uploaded) {
                    window.parent.postMessage({ type: "admin-section-save-failed", key: "Books", message: "The PDF upload failed. Please retry Save." }, window.location.origin);
                    return; // Keep the form and selected PDF available for retry.
                }
                setPendingBookFiles([]);
            }

            resetForm();
            toast({title:"Your changes have been saved",description:"The book details and prices were saved successfully."});
            window.parent.postMessage({ type: "admin-section-saved", key: "Books" }, window.location.origin);
            // Close the editor only after the save request succeeds.
            props.onSuccess(true);
        } catch(error:any) {
            toast({variant:"destructive",title:"Save failed",description:error?.message || "Something went wrong. Your form entries have been kept; please try again."});
            window.parent.postMessage({ type: "admin-section-save-failed", key: "Books", message: error?.message || "Save failed. Please try again." }, window.location.origin);
        } finally {
            setIsSaving(false);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files) {
            const selectedFiles = Array.from(files).slice(0, 5); // Limit to 5 files
            const fileReaders = selectedFiles.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(fileReaders).then(fileDataUrls => {
                setFormData(prevData => ({
                    ...prevData,
                    cover_images: fileDataUrls // Store an array of image URLs
                }));
            });
        }
    }

    function resetForm() {
        setFormData({
            title: '',
            description: '',
            published_date: '',
            isbn: '',
            price: 0,
            price_usd: 0,
            price_eur: 0,
            price_cny: 0,
            price_rub: 0,
            ratings: 0,
            cover_images: [],
            binding: '',
            language: 'English',
            genre: 'Suspense and Thriller',
            publisher: '',
            pages: 0,
            author_id: ''
        });
        setAuthorName(''); // Reset author name
        setPendingBookFiles([]);
        setPendingSavedBookId(null);
        setErrors({});
    }

    return (
        <>

            <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                validateAndAddBook();
            }} className="space-y-4">
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Complete the required details and enter the currency prices manually. Use the small blue <strong>Save</strong> button at the bottom-right of this editor.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Book Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        {errors.title && <span className="text-red-500">{errors.title}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                        <Select
                            name="author"
                            value={formData.author_id}
                            onValueChange={(value) => {
                                setFormData({ ...formData, author_id: value });
                                const selectedAuthor = authors.find(author => author.author_id === value);
                                setAuthorName(selectedAuthor ? selectedAuthor.name : ''); // Set author name
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Author" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortedAuthors.map((author) => (
                                    <SelectItem key={author.author_id} value={author.author_id}>
                                        {author.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.author && <span className="text-red-500">{errors.author}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="published_date">Published Date <span className="text-red-500">*</span></Label>
                        <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={formData.published_date}
                            onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                            className="ml-2 border rounded p-1"
                        />
                        {errors.published_date && <span className="text-red-500">{errors.published_date}</span>}
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN <span className="text-red-500">*</span></Label>
                        <Input
                            id="isbn"
                            name="isbn"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                            required
                        />
                        {errors.isbn && <span className="text-red-500">{errors.isbn}</span>}
                    </div> */}
                    <section className="col-span-full rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Book prices by currency</h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">Enter the exact price for this book in all five currencies. These amounts are saved separately and are not automatically converted.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="price" className="text-xs font-semibold text-slate-700 sm:text-sm">INR ₹ <span className="text-red-500">*</span></Label>
                                <Input id="price" name="price" type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price !== 0 ? String(formData.price) : ''} onChange={(e) => { const value = e.target.value; const parsed = value ? Number(value) : 0; setFormData({ ...formData, price: Number.isFinite(parsed) ? parsed : 0 }); }} className="h-10 rounded-lg bg-white" required />
                                {errors.price && <span className="block text-xs text-red-600">{errors.price}</span>}
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="price_usd" className="text-xs font-semibold text-slate-700 sm:text-sm">USD $ <span className="text-red-500">*</span></Label>
                                <Input id="price_usd" name="price_usd" type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price_usd ? String(formData.price_usd) : ''} onChange={(e) => setFormData({ ...formData, price_usd: e.target.value ? Number(e.target.value) : 0 })} className="h-10 rounded-lg bg-white" required />
                                {errors.price_usd && <span className="block text-xs text-red-600">{errors.price_usd}</span>}
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="price_eur" className="text-xs font-semibold text-slate-700 sm:text-sm">EUR € <span className="text-red-500">*</span></Label>
                                <Input id="price_eur" name="price_eur" type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price_eur ? String(formData.price_eur) : ''} onChange={(e) => setFormData({ ...formData, price_eur: e.target.value ? Number(e.target.value) : 0 })} className="h-10 rounded-lg bg-white" required />
                                {errors.price_eur && <span className="block text-xs text-red-600">{errors.price_eur}</span>}
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="price_cny" className="text-xs font-semibold text-slate-700 sm:text-sm">CNY ¥ <span className="text-red-500">*</span></Label>
                                <Input id="price_cny" name="price_cny" type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price_cny ? String(formData.price_cny) : ''} onChange={(e) => setFormData({ ...formData, price_cny: e.target.value ? Number(e.target.value) : 0 })} className="h-10 rounded-lg bg-white" required />
                                {errors.price_cny && <span className="block text-xs text-red-600">{errors.price_cny}</span>}
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <Label htmlFor="price_rub" className="text-xs font-semibold text-slate-700 sm:text-sm">RUB ₽ <span className="text-red-500">*</span></Label>
                                <Input id="price_rub" name="price_rub" type="number" min="0.01" step="0.01" inputMode="decimal" value={formData.price_rub ? String(formData.price_rub) : ''} onChange={(e) => setFormData({ ...formData, price_rub: e.target.value ? Number(e.target.value) : 0 })} className="h-10 rounded-lg bg-white" required />
                                {errors.price_rub && <span className="block text-xs text-red-600">{errors.price_rub}</span>}
                            </div>
                        </div>
                    </section>
                    {/* <div className="space-y-2">
                        <Label htmlFor="ratings">Ratings</Label>
                        <Input
                            id="ratings"
                            name="ratings"
                            type="number"
                            value={formData.ratings}
                            onChange={(e) => setFormData({ ...formData, ratings: parseInt(e.target.value) })}
                        />
                    </div> */}
                    <div>
                        <div className="space-y-2">
                            <Label htmlFor="cover_images">Cover Image</Label>
                            <Input
                                id="cover_images"
                                name="cover_images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                        {/* {console.log("yeah, formdata=>", formData)} */}
                        <div className='py-2'>
                            {formData.cover_images?.map((cimage) => {
                                return (
                                    <img src={cimage} className='w-10 border' />
                                )
                            })}
                        </div>
                    </div>
                    {/* <div className="space-y-2">
                        <Label htmlFor="binding">Binding</Label>
                        <Input
                            id="binding"
                            name="binding"
                            value={formData.binding}
                            onChange={(e) => setFormData({ ...formData, binding: e.target.value })}
                        />
                    </div> */}
                    <div className="space-y-2">
                        <Label htmlFor="genre">Genre</Label>
                        <Select name="genre" value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                            <SelectTrigger><SelectValue placeholder="Select Genre" /></SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_BOOK_GENRES.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={(event) => setFormData({ ...formData, language: event.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            {languageOptions.map((language) => (
                                <option key={language} value={language}>{language}</option>
                            ))}
                        </select>
                    </div>
                    {/* <div className="space-y-2">
                        <Label htmlFor="publisher">Publisher</Label>
                        <Input
                            id="publisher"
                            name="publisher"
                            value={formData.publisher}
                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        />
                    </div> */}
                    <div className="space-y-2">
                        <Label htmlFor="pages">Flipbook Pages <span className="text-red-500">*</span></Label>
                        <Input
                            id="pages"
                            name="pages"
                            type="number"
                            value={formData.pages !== 0 ? formData.pages.toString() : ''}
                            onChange={(e) => {
                                const pagesValue = e.target.value;
                                const parsedPages = pagesValue ? parseInt(pagesValue) : 0;
                                setFormData({ ...formData, pages: isNaN(parsedPages) ? 0 : parsedPages });
                            }}
                            required
                        />
                        {errors.pages && <span className="text-red-500">{errors.pages}</span>}
                    </div>
                    <div className="space-y-2">
                        <div className="space-y-2">
                            <input
                                ref={bookFileInputRef}
                                id="book_files"
                                name="book_files"
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={handleBookFileUpload}
                                disabled={isUploading}
                            />
                            {pendingBookFiles.length > 0 ? (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-amber-900">{book?.id ? "PDF selected — upload not yet confirmed" : "PDF selected"}</p>
                                        <p className="break-all text-xs text-amber-800">{pendingBookFiles[0].name}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (book?.id) {
                                                void uploadBookFiles(book.id, pendingBookFiles).then((uploaded) => {
                                                    if (uploaded) setPendingBookFiles([]);
                                                });
                                            } else {
                                                bookFileInputRef.current?.click();
                                            }
                                        }}
                                        disabled={isUploading}
                                        className="shrink-0"
                                    >
                                        {isUploading ? "Uploading…" : book?.id ? "Retry upload" : "Change file"}
                                    </Button>
                                </div>
                            ) : bookFiles.length > 0 ? (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-emerald-800">PDF uploaded</p>
                                        <p className="break-all text-xs text-emerald-700">{bookFiles[0].file_name}</p>
                                    </div>
                                    <Button type="button" onClick={() => bookFileInputRef.current?.click()} disabled={isUploading} className="shrink-0">
                                        Change file
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3">
                                    <p className="text-sm text-slate-600">No PDF uploaded yet.</p>
                                    <Button type="button" onClick={() => bookFileInputRef.current?.click()} disabled={isUploading} className="shrink-0">
                                        Upload file
                                    </Button>
                                </div>
                            )}
                            {!book?.id && pendingBookFiles.length > 0 && (
                                <p className="text-xs text-green-700">This PDF will upload when you press Save.</p>
                            )}
                            {isUploading && (
                                <div className="w-full rounded-full bg-gray-200 h-2.5">
                                    <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 mt-4 flex justify-end border-t border-slate-200 bg-white/95 px-1 py-3 backdrop-blur">
                    <Button type="submit" disabled={isSaving || isUploading || isLoadingBookDetails} className="min-h-9 min-w-20 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
                        {isLoadingBookDetails ? "Loading…" : isUploading ? "Uploading…" : isSaving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </form>
        </>
    );
}
