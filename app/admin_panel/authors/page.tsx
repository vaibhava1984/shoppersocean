'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

type AuthorData = {
    id: string;
    name: string;
};

const AuthorsManagement = () => {
    const { toast } = useToast();
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/books', { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load authors');
            setAuthors(data.data || []);
        } catch (error) {
            console.error('Error fetching authors:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to load authors",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold">Authors Management</h3>
                        <Button onClick={fetchAuthors}>Refresh</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>A_ID</TableHead>
                                <TableHead>Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2}>Loading authors...</TableCell>
                                </TableRow>
                            ) : authors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2}>No authors found.</TableCell>
                                </TableRow>
                            ) : (
                                authors.map((author) => (
                                    <TableRow key={author.id} className="text-black">
                                        <TableCell>{author.id}</TableCell>
                                        <TableCell>{author.name}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </main>
            </div>
        </div>
    );
};

export default AuthorsManagement;
