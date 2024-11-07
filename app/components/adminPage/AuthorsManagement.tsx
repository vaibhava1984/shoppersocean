'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

const AuthorsManagement = () => {
    const supabase = createClient();
    const [authors, setAuthors] = useState([]);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
    const [isEditAuthorOpen, setIsEditAuthorOpen] = useState(false);
    const [newAuthor, setNewAuthor] = useState({ name: '', bio: '' });

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        const { data, error } = await supabase.from('authors').select('*');
        if (error) {
            console.error('Error fetching authors:', error);
        } else {
            // console.log("data=>", data)
            setAuthors(data);
        }
    };

    const handleEditAuthor = (author) => {
        setEditingAuthor(author);
        setIsEditAuthorOpen(true)
    };

    const handleUpdateAuthor = async () => {
        if (editingAuthor) {
            const { data, error } = await supabase
                .from('authors')
                .update({
                    ...editingAuthor,
                    updated_at: new Date().toISOString() // Set updated_at to the current time
                })
                .eq('author_id', editingAuthor.author_id);

            if (error) {
                console.error('Error updating author:', error);
            } else {
                setEditingAuthor(null);
                setIsEditAuthorOpen(false);
                fetchAuthors();
            }
        }
    };

    const handleDeleteAuthor = async (id, authorName) => {
        // Check for books associated with this author
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('*')
            .eq('author_id', id);

        if (booksError) {
            console.error('Error checking books:', booksError);
            return;
        }

        if (books.length > 0) {
            // Show a dialog notifying the admin
            alert(`Please delete the book records under ${authorName} before deleting this author.`);
        } else {
            // No books found, proceed with deletion
            const { error } = await supabase
                .from('authors')
                .delete()
                .eq('author_id', id);

            if (error) {
                console.error('Error deleting author:', error);
            } else {
                fetchAuthors();
            }
        }
    };


    const handleAddAuthor = async () => {
        if (newAuthor.name && newAuthor.bio) {
            const { data, error } = await supabase
                .from('authors')
                .insert([{ ...newAuthor }])
                .single();
            console.log("testing:::", newAuthor)

            if (error) {
                console.error('Error adding author:', error);
            } else {
                fetchAuthors();
                setIsAddAuthorOpen(false);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">Authors Management</h3>
                <Dialog open={isAddAuthorOpen} onOpenChange={setIsAddAuthorOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Author</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Author</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newAuthor.name}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bio" className="text-right">
                                    Bio
                                </Label>
                                <Textarea
                                    id="bio"
                                    value={newAuthor.bio}
                                    onChange={(e) => setNewAuthor({ ...newAuthor, bio: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddAuthor}>Save and Add</Button>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>A_ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {authors.filter(d => d).map((author) => (
                        <TableRow key={author.author_id} className='text-black'>
                            <TableCell>{author.author_id}</TableCell>
                            <TableCell>{author.name}</TableCell>
                            <TableCell>{author.bio}</TableCell>
                            <TableCell>{new Date(author.created_at).toLocaleString()}</TableCell>
                            <TableCell>{new Date(author.updated_at).toLocaleString()}</TableCell>
                            <TableCell>
                                <Dialog open={isEditAuthorOpen} onOpenChange={setIsEditAuthorOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="mr-2 text-black" onClick={() => handleEditAuthor(author)}>
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Author</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="edit-name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="edit-name"
                                                    value={editingAuthor?.name || ''}
                                                    onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="edit-bio" className="text-right">
                                                    Bio
                                                </Label>
                                                <Textarea
                                                    id="edit-bio"
                                                    value={editingAuthor?.bio || ''}
                                                    onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleUpdateAuthor}>Save and Update</Button>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="destructive" onClick={() => handleDeleteAuthor(author.author_id, author.name)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AuthorsManagement;
