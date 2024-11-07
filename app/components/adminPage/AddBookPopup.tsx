import React, { useState, FormEvent, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { BookType } from "@/types/Books.type"

interface Author {
    author_id: string;
    name: string;
}

type propsType = {
    book?: BookType,
    onSuccess: (closePopup: boolean) => void,
}

export default function AddBookPopup(props: propsType) {
    const { book } = props;
    const supabase = createClient();
    const [authors, setAuthors] = useState<Author[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Omit<BookType, 'id' | 'author_name' | 'updated_at'>>({
        title: book?.title ?? '',
        description: book?.description ?? '',
        published_date: book?.published_date ?? '',
        isbn: book?.isbn ?? '',
        price: book?.price ?? 0,
        ratings: book?.ratings ?? 0,
        cover_images: book?.cover_images ?? '',
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
        if (!formData.isbn) validationErrors.isbn = 'ISBN is required';
        if (!formData.price || isNaN(Number(formData.price))) validationErrors.price = 'Valid price is required';
        if (!formData.pages || isNaN(Number(formData.pages))) validationErrors.pages = 'Valid pages number is required';
        if (!formData.published_date) validationErrors.published_date = 'Published date is required';

        if (Object.keys(validationErrors).length === 0) {
            const isbnExists = await checkIsbnExists(formData.isbn);
            if (isbnExists && !book) {
                alert('ISBN already exists, please provide a correct ISBN number.');
                return;
            }
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
                    updated_at: new Date().toISOString()
                }).eq('id', book.id);

                console.log("data update===>", data);
                console.log("error===>", error);
                if (error) throw error;
                resetForm();
                props.onSuccess(true);
            } else {
                const bookWithAuthor = { ...formData, author_name: authorName }; // Add author_name
                const { data, error } = await supabase.from('books').insert([bookWithAuthor]);
                console.log("data===>", data);
                console.log("error===>", error);
                if (error) throw error;
                resetForm();
                props.onSuccess(true);
            }
        } catch (error) {
            console.error('Error adding book:', error);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prevData => ({
                    ...prevData,
                    cover_images: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
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
            cover_images: '',
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

                <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN <span className="text-red-500">*</span></Label>
                    <Input
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        required
                    />
                    {errors.isbn && <span className="text-red-500">{errors.isbn}</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        required
                    />
                    {errors.price && <span className="text-red-500">{errors.price}</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ratings">Ratings</Label>
                    <Input
                        id="ratings"
                        name="ratings"
                        type="number"
                        value={formData.ratings}
                        onChange={(e) => setFormData({ ...formData, ratings: parseInt(e.target.value) })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cover_images">Cover Image</Label>
                    <Input
                        id="cover_images"
                        name="cover_images"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="binding">Binding</Label>
                    <Input
                        id="binding"
                        name="binding"
                        value={formData.binding}
                        onChange={(e) => setFormData({ ...formData, binding: e.target.value })}
                    />
                </div>
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
                <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                        id="publisher"
                        name="publisher"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pages">Pages <span className="text-red-500">*</span></Label>
                    <Input
                        id="pages"
                        name="pages"
                        type="number"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                        required
                    />
                    {errors.pages && <span className="text-red-500">{errors.pages}</span>}
                </div>
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
    );
}
