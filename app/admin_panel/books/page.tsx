"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AddBookPopup from "./AddBookPopup";
import { createClient } from "@/utils/supabase/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookType } from "@/types/Books.type"
import AdminSidebar from "../adminSidebar"
import { Toaster } from "@/components/ui/toaster"

interface Column {
    key: keyof BookType;
    label: string;
}

export default function Books() {
    const [books, setBooks] = useState<BookType[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showViewAll, setShowViewAll] = useState(true);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<BookType | null>(null);

    const [selectedColumns, setSelectedColumns] = useState<any>(new Set(['title', 'author_name', 'language']));

    const availableColumns: Column[] = [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'isbn', label: 'ISBN' },
        { key: 'pages', label: 'Pages' },
        { key: 'price', label: 'Price' },
        { key: 'ratings', label: 'Ratings' },
        { key: 'language', label: 'Language' },
        { key: 'publisher', label: 'Publisher' },
        { key: 'author_name', label: 'Author' },
        { key: 'binding', label: 'Binding' },
        { key: 'published_date', label: 'Published Date' }
    ];

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = books.filter(book =>
                book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.publisher?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        } else {
            setFilteredBooks([]);
        }
    }, [searchQuery, books]);

    async function fetchBooks() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.from('books').select(`
                id,
                title,
                description,
                published_date,
                isbn,
                price,
                ratings,
                cover_images,
                binding,
                language,
                publisher,
                pages,
                author_id,
                author_name,
                updated_at,
                authors (
                    name
                )
            `).eq('is_deleted', false);
            if (error) throw error;
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }

    async function handleDeleteBook(book: BookType) {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('books')
                .update({ is_deleted: true })
                .eq('id', book.id);

            if (error) throw error;

            fetchBooks();
            setShowDeleteAlert(false);
            setBookToDelete(null);
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    }

    const displayedBooks = filteredBooks.length > 0 ? filteredBooks : (showViewAll ? books : []);

    return (
        <TooltipProvider>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Books Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between mb-4">
                                    <div className="space-x-2">
                                        <Button onClick={() => setShowAddForm(true)}>Add New Book</Button>
                                        <Button onClick={() => setShowColumnSelector(true)}>Columns to Display</Button>
                                    </div>
                                </div>
                                <Input
                                    placeholder="Search by title, author, language, or publisher"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mb-4"
                                />
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Array.from(selectedColumns).map((column, columnIndex) => (
                                                <TableHead key={`${column}_${columnIndex}`}>
                                                    {availableColumns.find(col => col.key === column)?.label}
                                                </TableHead>
                                            ))}
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedBooks.map((book) => (
                                            <TableRow key={book.id}>
                                                {Array.from(selectedColumns).map((column, columnIndex) => (
                                                    <TableCell key={`${column}_${columnIndex}`}>{column === "author_name" ? book?.authors?.name ?? `${book[column]} 000` : book[column]}</TableCell>
                                                ))}
                                                <TableCell>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedBook(book);
                                                            console.log("why ajanya=>", book)
                                                            setShowEditForm(true);
                                                        }}
                                                        className="mr-2"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setBookToDelete(book);
                                                            setShowDeleteAlert(true);
                                                        }}
                                                        variant="destructive"
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Book</DialogTitle>
                                </DialogHeader>
                                <AddBookPopup onSuccess={(closePopup) => {
                                    fetchBooks();
                                    if (closePopup) {
                                        setShowAddForm(false);
                                    }
                                }} />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Book</DialogTitle>
                                </DialogHeader>
                                {selectedBook && (
                                    <AddBookPopup
                                        book={selectedBook}
                                        onSuccess={() => {
                                            fetchBooks();
                                            setShowEditForm(false);
                                        }}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showColumnSelector} onOpenChange={setShowColumnSelector}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Select Columns</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4">
                                    {availableColumns.map((column) => (
                                        <div key={column.key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={column.key}
                                                checked={selectedColumns.has(column.key)}
                                                onCheckedChange={(checked) => {
                                                    const newColumns = new Set(selectedColumns);
                                                    if (checked) {
                                                        newColumns.add(column.key);
                                                    } else {
                                                        newColumns.delete(column.key);
                                                    }
                                                    setSelectedColumns(newColumns);
                                                }}
                                            />
                                            <label htmlFor={column.key}>{column.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => bookToDelete && handleDeleteBook(bookToDelete)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}