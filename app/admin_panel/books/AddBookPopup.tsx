import React, { useState, FormEvent, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { BookType } from "@/types/Books.type"
import { useToast } from "@/hooks/use-toast"

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
    const supabase = createClient();
    const [authors, setAuthors] = useState<Author[]>([]);
    const [bookFiles, setBookFiles] = useState<BookFile[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Omit<BookType, 'id' | 'author_name' | 'updated_at'>>({
        title: book?.title ?? '',
        description: book?.description ?? '',
        published_date: book?.published_date ?? '',
        isbn: book?.isbn ?? '',
        price: book?.price ?? 0,
        ratings: book?.ratings ?? 0,
        cover_images: book?.cover_images ?? [],
        binding: book?.binding ?? '',
        language: book?.language ?? 'English',
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
            const { data, error } = await supabase
                .from('private_book_files')
                .select('*')
                .eq('book_id', bookId);

            if (error) throw error;
            setBookFiles(data || []);
        } catch (error) {
            console.error('Error fetching book files:', error);
        }
    }

    // Handle book file uploads
    async function handleBookFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || !book?.id) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `protected-books/${fileName}`;

                // Upload file to storage
                const { error: uploadError } = await supabase.storage
                    .from('books-content')
                    .upload(filePath, file, {
                        cacheControl: '0',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                // Add record to private_book_files table
                const { error: dbError } = await supabase
                    .from('private_book_files')
                    .insert({
                        book_id: book.id,
                        file_path: filePath,
                        file_name: file.name,
                        file_type: fileExt
                    });

                if (dbError) throw dbError;

                setUploadProgress(((i + 1) / files.length) * 100);
            }

            // Refresh book files list
            await fetchBookFiles(book.id);

            toast({
                title: "Success!",
                description: "Files uploaded successfully",
            });
        } catch (error: any) {
            console.error('Error uploading files:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.message || "Failed to upload files",
            });
        } finally {
            setIsUploading(false);
        }
    }

    // Remove a book file
    async function removeBookFile(fileId: string, filePath: string) {
        if (!book?.id) return;

        try {
            // Remove from storage
            const { error: storageError } = await supabase.storage
                .from('books-content')
                .remove([filePath]);

            if (storageError) throw storageError;

            // Remove from private_book_files table
            const { error: dbError } = await supabase
                .from('private_book_files')
                .delete()
                .eq('id', fileId);

            if (dbError) throw dbError;

            // Refresh book files list
            await fetchBookFiles(book.id);

            toast({
                title: "Success!",
                description: "File removed successfully",
            });
        } catch (error: any) {
            console.error('Error removing file:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.message || "Failed to remove file",
            });
        }
    }

    async function fetchAuthors() {
        try {
            const { data, error } = await supabase
                .from('authors')
                .select('author_id, name')
                .order('name');

            if (error) throw error;
            setAuthors(data || []);
        } catch (error) {
            console.error('Error fetching authors:', error);
        }
    }

    async function validateAndAddBook() {
        const validationErrors: Record<string, string> = {};
        if (!formData.title) {
            alert('Please fill in the book title.');
            return;
        }
        if (!authorName) {
            alert('Please fill in the author name.');
            return; // Show alert if author name is not provided
        }
        if (!formData.author_id) validationErrors.author = 'Author is required';
        // if (!formData.isbn) validationErrors.isbn = 'ISBN is required';
        if (!formData.price || isNaN(Number(formData.price))) validationErrors.price = 'Valid price is required';
        if (!formData.pages || isNaN(Number(formData.pages))) validationErrors.pages = 'Valid pages number is required';
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
        }
    }

    async function checkIsbnExists(isbn: string) {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('id')
                .eq('isbn', isbn);

            if (error) throw error;
            return data && data.length > 0;
        } catch (error) {
            console.error('Error checking ISBN:', error);
            return false;
        }
    }

    async function addOrUpdateBook() {
        try {

            if (book) {
                const { data, error } = await supabase.from('books').update({
                    ...formData,
                    updated_at: new Date().toISOString(),
                    isCompletelyFilled: bookFiles?.length > 0,
                }).eq('id', book.id);

                // console.log("data update===>", data);
                // console.log("error===>", error);
                if (error) throw error;
                resetForm();
                toast({
                    title: "Success!",
                    description: "Updating Book Success",
                })
                props.onSuccess(true);
            } else {
                const bookWithAuthor = { ...formData, author_name: authorName }; // Add author_name
                const { data, error } = await supabase.from('books').insert([bookWithAuthor]);
                // console.log("data===>", data);
                // console.log("error===>", error);
                if (error) throw error;
                resetForm();
                toast({
                    title: "Success!",
                    description: "Adding Book Success",
                })
                props.onSuccess(true);
            }
        } catch (error: any) {
            console.error('Error adding book:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.message || "Something went wrong",
            })
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
            ratings: 0,
            cover_images: [],
            binding: '',
            language: 'English',
            publisher: '',
            pages: 0,
            author_id: ''
        });
        setAuthorName(''); // Reset author name
        setErrors({});
    }

    return (
        <>

            <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                validateAndAddBook();
            }} className="space-y-4">
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
                                {authors.map((author) => (
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
                        <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="language">Language</Label>
                        <Select name="language" value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
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
                    {book?.id && (
                        <div className="space-y-2">
                            <Label htmlFor="book_files">Downloadable Book Files</Label>
                            <Input
                                id="book_files"
                                name="book_files"
                                type="file"
                                accept=".pdf,.epub,.mobi,.jpeg"
                                multiple
                                onChange={handleBookFileUpload}
                                disabled={isUploading}
                            />
                            {isUploading && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}

                            {/* Display uploaded files */}
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
                    )}
                </div>
                <div className="flex space-x-4 mt-4">
                    <Button type="submit">Save</Button>
                    {/* <Button type="button" onClick={() => {
                        validateAndAddBook();
                        resetForm();
                        props.onSuccess(false);
                    }}>Add Another</Button> */}
                </div>
            </form>
        </>
    );
}
