'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import AdminSidebar from "../adminSidebar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type AuthorApprovalsType = {
    user_id: string,
    created_at: string,
    profiles: {
        email: string
    }
}

const AuthorsApproval = () => {
    const { toast } = useToast()
    const supabase = createClient();
    const [authors, setAuthors] = useState<AuthorApprovalsType[]>([]);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        const { data, error } = await supabase.from('authors_interest_submission').select(`
            user_id,
            created_at,
            profiles(email)
          `);
        if (error) {
            console.error('Error fetching authors:', error);
        } else {
            // console.log("data new=>", data)
            setAuthors(data as unknown as AuthorApprovalsType[]);
        }
    };

    const approveAuthor = async (authorId: string) => {
        try {
            const response = await fetch('/api/authors_approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ author_id: authorId }),
            });

            const data = await response.json();

            if (!response.ok) {
                // throw new Error(data.error || 'Failed to approve author');
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Something went wrong",
                })
                return;
            }

            toast({
                title: "Success!",
                description: "Approval success.",
            })
            fetchAuthors();

            return data;
        } catch (error) {
            console.error('Error approving author:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to approve author",
            })
            return;
        }
    };

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-black">Authors Approvals</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {authors.filter(d => d).map((author) => (
                                <TableRow key={author.user_id} className='text-black'>
                                    <TableCell>{author.user_id}</TableCell>
                                    <TableCell>{author.profiles?.email}</TableCell>
                                    <TableCell>{author.created_at?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" onClick={() => approveAuthor(author.user_id)}>
                                            Approve
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

export default AuthorsApproval;
