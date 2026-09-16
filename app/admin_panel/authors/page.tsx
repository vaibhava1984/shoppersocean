'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import AdminSidebar from "../adminSidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type AuthorData = {
    created_at: string;
    name: string;
    bio: string;
    updated_at: string;
    author_id: string;
    user_id: string;
    profiles: {
        email: string;
    };
};

type AuthorEditData = {
    name: string;
    bio: string;
    user_id: string;
    author_id?: string;
};

const AuthorsManagement = () => {
    const { toast } = useToast()
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const [editingAuthorFullData, setEditingAuthorFullData] = useState<AuthorData | null>(null);
    const [editingAuthor, setEditingAuthor] = useState<AuthorEditData | null>(null);
    const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
    const [isEditAuthorOpen, setIsEditAuthorOpen] = useState(false);
    const [newAuthor, setNewAuthor] = useState<{ name: string, bio: string, author_id: string }>({ name: '', bio: '', author_id: '' });
    const [allUsersLists, setAllUsersLists] = useState<{ id: string, full_name: string, email: string }[]>([]);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('authors').select('*, profiles(email)').eq('is_deleted', false);
        if (error) {
            console.error('Error fetching authors:', error);
        } else {
            console.log("data=>", data)
            setAuthors(data ?? []);
        }
    };

    useEffect(() => {
        if (isAddAuthorOpen || isEditAuthorOpen) {
            fetchAllUsers();
        }
    }, [isAddAuthorOpen, isEditAuthorOpen]);

    const fetchAllUsers = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('profiles').select('id, full_name, email');
        if (error) {
            console.error('Error fetching authors:', error);
        } else {
            console.log("fetchAllUsers data=>", data)
            setAllUsersLists(data ?? []);
        }
    };

    const handleEditAuthor = (author: AuthorData) => {
        setEditingAuthor(author);
        setEditingAuthorFullData(author);
        setIsEditAuthorOpen(true)
    };

    const handleUpdateAuthor = async () => {
        if (editingAuthor) {
            const supabase = createClient();
            const { error } = await supabase
                .from('authors')
                .update({
                    ...editingAuthor,
                    updated_at: new Date().toISOString()
                })
                .eq('author_id', editingAuthor.author_id);

            if (error) {
                console.error('Error updating author:', error);
            } else {
                setEditingAuthor(null);
                setEditingAuthorFullData(null);
                setIsEditAuthorOpen(false);
                fetchAuthors();
            }
        }
    };

    const handleDeleteAuthor = async (author_id: string, user_id: string) => {
        const response = await fetch('/api/delete_author', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ author_id: author_id, user_id }),
        });

        const data = await response.json();

        if (!response.ok) {
            toast({
                variant: "destructive",
                title: "Error",
                description: data.error || "Something went wrong",
            })
            return;
        }

        toast({
            title: "Delete!",
            description: "Deleted Author Successfully",
        })
        fetchAuthors();
    };

    const handleAddAuthor = async () => {
        if (newAuthor.name && newAuthor.author_id) {
            const response = await fetch('/api/add_authors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newAuthor.name,
                    user_id: newAuthor.author_id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Something went wrong",
                })
                return;
            }

            toast({
                title: "Success!",
                description: "Adding Author Success",
            })
            fetchAuthors();
            setIsAddAuthorOpen(false);
        } else {
            alert("Please fill all the fields")
        }
    };

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto p-8">
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
                                        <Label htmlFor="author">Users <span className="text-red-500">*</span></Label>
                                        <Select
                                            name="author"
                                            value={newAuthor.author_id}
                                            onValueChange={(value: string) => {
                                                setNewAuthor({ ...newAuthor, author_id: value });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select User" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allUsersLists.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.full_name ?? user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                <TableHead>Email</TableHead>
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
                                    <TableCell>{author.profiles?.email}</TableCell>
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
                                                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                                                        <Input
                                                            id="edit-name"
                                                            value={editingAuthor?.name || ''}
                                                            onChange={(e) => setEditingAuthor({
                                                                name: e.target.value,
                                                                bio: editingAuthor?.bio ?? '',
                                                                user_id: editingAuthor?.user_id ?? '',
                                                                author_id: editingAuthor?.author_id
                                                            })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="edit-bio" className="text-right">Bio</Label>
                                                        <Textarea
                                                            id="edit-bio"
                                                            value={editingAuthor?.bio || ''}
                                                            onChange={(e) => setEditingAuthor({
                                                                name: editingAuthor?.name ?? '',
                                                                bio: e.target.value,
                                                                user_id: editingAuthor?.user_id ?? '',
                                                                author_id: editingAuthor?.author_id
                                                            })}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Label htmlFor="edit-author" className="text-right mr-2">Author</Label>
                                                        <div className='bg-gray-100 p-2 grid-col-span-3'>
                                                            {editingAuthorFullData?.profiles?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button onClick={handleUpdateAuthor}>Save and Update</Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="destructive" onClick={() => handleDeleteAuthor(author.author_id, author.user_id)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </main>
            </div>
        </div>
    );
};

export default AuthorsManagement;
