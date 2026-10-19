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
        { key: 'price', label: 'Price (INR)' },
        { key: 'price_usd', label: 'Price (USD)' },
        { key: 'price_eur', label: 'Price (EUR)' },
        { key: 'price_cny', label: 'Price (CNY)' },
        { key: 'price_rub', label: 'Price (RUB)' },
        { key: 'ratings', label: 'Ratings' },
        { key: 'language', label: 'Language' },
        { key: 'genre', label: 'Genre' },
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
            const response=await fetch("/api/admin/books",{cache:"no-store"});
            const result=await response.json();
            if(!response.ok) throw new Error(result.error || "Failed to fetch books");
            setBooks(result.books || []);
        } catch(error){ console.error("Error fetching books:",error); }
    }

    async function handleDeleteBook(book: BookType) {
        try {
            const response=await fetch("/api/admin/books",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:book.id})});
            const result=await response.json();
            if(!response.ok) throw new Error(result.error || "Unable to delete book");
            await fetchBooks(); setShowDeleteAlert(false); setBookToDelete(null);
        } catch(error){ console.error("Error deleting book:",error); }
    }

    const displayedBooks = searchQuery.trim() ? filteredBooks : (showViewAll ? books : []);

    return (
        <TooltipProvider>
            <Toaster />
            <div className="flex min-h-screen bg-slate-50">
                <AdminSidebar />
                <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
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
                                    className="mb-4 h-11 rounded-xl"
                                />
                                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                                    <span>{displayedBooks.length} {displayedBooks.length === 1 ? "book" : "books"}</span>
                                    <span className="md:hidden">Tap Edit to manage details and prices</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:hidden">
                                    {displayedBooks.map((book) => (
                                        <article key={book.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="break-words text-sm font-bold leading-snug text-slate-900">{book.title}</h3>
                                                    <p className="mt-1 text-xs text-slate-600">{book.author_name || "Author not set"} · {book.language || "Language not set"}</p>
                                                </div>
                                                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{book.pages || "—"} pages</span>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {([
                                                    ["INR ₹", book.price_inr ?? book.price],
                                                    ["USD $", book.price_usd],
                                                    ["EUR €", book.price_eur],
                                                    ["CNY ¥", book.price_cny],
                                                    ["RUB ₽", book.price_rub],
                                                ] as const).map(([label, price]) => (
                                                    <div key={label} className="rounded-lg bg-slate-50 px-2.5 py-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                                                        <p className="mt-0.5 text-sm font-bold text-slate-800">{Number(price) > 0 ? Number(price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : <span className="text-amber-600">Set price</span>}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <Button className="h-9 flex-1 rounded-lg" onClick={() => { setSelectedBook(book); setShowEditForm(true); }}>Edit book & prices</Button>
                                                <Button className="h-9 rounded-lg" variant="destructive" onClick={() => { setBookToDelete(book); setShowDeleteAlert(true); }}>Delete</Button>
                                            </div>
                                        </article>
                                    ))}
                                    {displayedBooks.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No books found.</p>}
                                </div>
                                <div className="hidden overflow-x-auto md:block">
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
                                                    <TableCell key={`${column}_${columnIndex}`}>
                                                        {column === "author_name" ? book?.authors?.name ?? `${book[column]} 000` : book[column]}
                                                    </TableCell>
                                                ))}
                                                <TableCell>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedBook(book);
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
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                            <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle>Add New Book</DialogTitle>
                                </DialogHeader>
                                <AddBookPopup key="new-book" onSuccess={(closePopup) => {
                                    fetchBooks();
                                    if (closePopup) {
                                        setShowAddForm(false);
                                    }
                                }} />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                            <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Book</DialogTitle>
                                </DialogHeader>
                                {selectedBook && (
                                    <AddBookPopup
                                        key={selectedBook.id}
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