import React, { useState, FormEvent, useEffect } from 'react';
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
    const [pendingBookFiles, setPendingBookFiles] = useState<File[]>([]);
    // Retain the newly created book ID if its PDF upload fails, so retrying Save
    // uploads the selected PDF without creating a duplicate book record.
    const [pendingSavedBookId, setPendingSavedBookId] = useState<string | null>(null);

    const sortedAuthors = [...authors].sort((a, b) => a.name.localeCompare(b.name));
    const languageOptions = Array.from(new Set([...SUPPORTED_BOOK_LANGUAGES, ...(book?.language ? [book.language] : [])])).sort((a, b) => a.localeCompare(b));

    const [formData, setFormData] = useState<Omit<BookType, 'id' | 'author_name' | 'updated_at'>>({
        title: book?.title ?? '',
        description: book?.description ?? '',
        published_date: book?.published_date ?? '',
        isbn: book?.isbn ?? '',
        price: book?.price_inr ?? book?.price ?? 0,
        price_usd: Number(book?.price_usd ?? 0),
        price_eur: Number(book?.price_eur ?? 0),
        price_cny: Number(book?.price_cny ?? 0),
        price_rub: Number(book?.price_rub ?? 0),
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
        if (!book?.id) {
            setPendingBookFiles(Array.from(files));
            toast({ title: "Files selected", description: "The book files will upload after you save the book details." });
            return;
        }
        await uploadBookFiles(book.id, Array.from(files));
    }

    async function uploadBookFiles(bookId: string, files: File[]): Promise<boolean> {
        if (!files.length) return false;
        setIsUploading(true); setUploadProgress(0);
        try {
            const form = new FormData();
            form.append("bookId", bookId);
            Array.from(files).forEach(file => form.append("file", file));
            const response = await fetch("/api/admin/book-files", { method: "POST", body: form });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to upload files");
            setUploadProgress(100);
            await fetchBookFiles(bookId);
            toast({ title:"Success!", description:"Your book is uploaded successfully." });
            window.parent.postMessage({ type: "admin-book-uploaded", key: "Books" }, window.location.origin);
            return true;
        } catch (error:any) {
            toast({ variant:"destructive", title:"PDF upload failed", description:error?.message || "Failed to upload files. Please retry Save." });
            return false;
        } finally { setIsUploading(false); }
    }

    // Remove a book file
    async function removeBookFile(fileId: string, filePath: string) {
        if (!book?.id) return;
        try {
            const response = await fetch("/api/admin/book-files", {
                method:"DELETE", headers:{"Content-Type":"application/json"},
                body:JSON.stringify({id:fileId,filePath})
            });
            const result=await response.json();
            if(!response.ok) throw new Error(result.error || "Failed to remove file");
            await fetchBookFiles(book.id);
            toast({ title:"Success!", description:"File removed successfully" });
        } catch(error:any) {
            toast({ variant:"destructive", title:"Error", description:error?.message || "Failed to remove file" });
        }
    }

    async function fetchAuthors() {
        try {
            const response=await fetch("/api/admin/authors",{cache:"no-store"});
            const result=await response.json();
            if(!response.ok) throw new Error(result.error || "Failed to fetch authors");
            setAuthors(result.authors || []);
        } catch(error){ console.error("Error fetching authors:",error); }
    }

    async function validateAndAddBook() {
        if (isSaving || isUploading) return;
        const validationErrors: Record<string, string> = {};
        if (!formData.title.trim()) validationErrors.title = 'Book title is required';
        if (!authorName || !formData.author_id) validationErrors.author = 'Please select an author';
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            toast({ variant: "destructive", title: "Please check the form", description: Object.values(validationErrors).join(". ") });
            return;
        }
        if (!formData.author_id) validationErrors.author = 'Author is required';
        // if (!formData.isbn) validationErrors.isbn = 'ISBN is required';
        if (!formData.price || !Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) validationErrors.price = 'Valid INR price is required';
        if (!formData.price_usd || !Number.isFinite(Number(formData.price_usd)) || Number(formData.price_usd) <= 0) validationErrors.price_usd = 'Valid USD price is required';
        if (!formData.price_eur || !Number.isFinite(Number(formData.price_eur)) || Number(formData.price_eur) <= 0) validationErrors.price_eur = 'Valid EUR price is required';
        if (!formData.price_cny || !Number.isFinite(Number(formData.price_cny)) || Number(formData.price_cny) <= 0) validationErrors.price_cny = 'Valid CNY price is required';
        if (!formData.price_rub || !Number.isFinite(Number(formData.price_rub)) || Number(formData.price_rub) <= 0) validationErrors.price_rub = 'Valid RUB price is required';
        if (!formData.pages || isNaN(Number(formData.pages))) validationErrors.pages = 'Valid pages number is required';
        if (Number(formData.pages) < 100 && formData.genre !== 'Short Books') {
            validationErrors.pages = "Not fit for full book. Submit in 'Short Books' genre.";
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
                const payload:any = { ...formData, price_inr: formData.price, author_name: authorName, id: book?.id };
                const response=await fetch("/api/admin/books",{method:book?.id ? "PUT" : "POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
                const result=await response.json();
                if(!response.ok) throw new Error(result.error || "Something went wrong");
                savedBookId = String(result.id || book?.id || "");
                if (!book?.id && savedBookId) setPendingSavedBookId(savedBookId);
            }

            if (pendingBookFiles.length) {
                if (!savedBookId) throw new Error("Book details were saved, but the PDF could not be linked. Please retry Save.");
                const uploaded = await uploadBookFiles(savedBookId, pendingBookFiles);
                if (!uploaded) return; // Keep the form and selected PDF available for retry.
                setPendingBookFiles([]);
            }

            resetForm();
            toast({title:"Success!",description:book ? "Updating Book Success" : "Adding Book Success"});
            // The form owns its success state and closes only after the save/upload succeeds.
            // Do not send a duplicate parent-level save notice for Books.
            props.onSuccess(true);
        } catch(error:any) {
            toast({variant:"destructive",title:"Save failed",description:error?.message || "Something went wrong. Your form entries have been kept; please try again."});
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
                <div className="mb-4 flex justify-end border-b pb-3">
                    <Button type="submit" disabled={isUploading || isSaving}>{isUploading ? "Uploading…" : isSaving ? "Saving…" : "Save Book"}</Button>
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
                            placeholder="YYYY-MM-DD"
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
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (INR ₹) <span className="text-red-500">*</span></Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price !== 0 ? formData.price.toString() : ''}
                            onChange={(e) => {
                                const priceValue = e.target.value;
                                const parsedPrice = priceValue ? parseFloat(priceValue) : 0; // parseFloat will return NaN for invalid input, or 0 for empty input
                                setFormData({ ...formData, price: isNaN(parsedPrice) ? 0 : parsedPrice })
                            }}
                            required
                        />
                        {errors.price && <span className="text-red-500">{errors.price}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_usd">Price (USD $) <span className="text-red-500">*</span></Label>
                        <Input id="price_usd" name="price_usd" type="number" min="0.01" step="0.01" value={formData.price_usd ? String(formData.price_usd) : ''} onChange={(e) => setFormData({ ...formData, price_usd: e.target.value ? Number(e.target.value) : 0 })} required />
                        {errors.price_usd && <span className="text-red-500">{errors.price_usd}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_eur">Price (EUR €) <span className="text-red-500">*</span></Label>
                        <Input id="price_eur" name="price_eur" type="number" min="0.01" step="0.01" value={formData.price_eur ? String(formData.price_eur) : ''} onChange={(e) => setFormData({ ...formData, price_eur: e.target.value ? Number(e.target.value) : 0 })} required />
                        {errors.price_eur && <span className="text-red-500">{errors.price_eur}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_cny">Price (CNY ¥) <span className="text-red-500">*</span></Label>
                        <Input id="price_cny" name="price_cny" type="number" min="0.01" step="0.01" value={formData.price_cny ? String(formData.price_cny) : ''} onChange={(e) => setFormData({ ...formData, price_cny: e.target.value ? Number(e.target.value) : 0 })} required />
                        {errors.price_cny && <span className="text-red-500">{errors.price_cny}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_rub">Price (RUB ₽) <span className="text-red-500">*</span></Label>
                        <Input id="price_rub" name="price_rub" type="number" min="0.01" step="0.01" value={formData.price_rub ? String(formData.price_rub) : ''} onChange={(e) => setFormData({ ...formData, price_rub: e.target.value ? Number(e.target.value) : 0 })} required />
                        {errors.price_rub && <span className="text-red-500">{errors.price_rub}</span>}
                    </div>
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
                        <Select name="language" value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languageOptions.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
                        <Label htmlFor="pages">Pages <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="book_files">Add Book File (PDF, EPUB, MOBI, or JPEG)</Label>
                        <Input
                            id="book_files"
                            name="book_files"
                            type="file"
                            accept=".pdf,.epub,.mobi,.jpeg,.jpg"
                            multiple
                            onChange={handleBookFileUpload}
                            disabled={isUploading}
                        />
                        {!book?.id && pendingBookFiles.length > 0 && (
                            <p className="text-sm text-green-700">{pendingBookFiles.length} file(s) selected. They will upload after you save the book.</p>
                        )}
                        {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        {bookFiles.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium">Uploaded Files:</h4>
                                <ul className="list-disc">
                                    {bookFiles.map((file) => (
                                        <li key={file.id} className="flex items-center justify-between">
                                            <span>{file.file_name}</span>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeBookFile(file.id, file.file_path)}
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

            </form>
        </>
    );
}
