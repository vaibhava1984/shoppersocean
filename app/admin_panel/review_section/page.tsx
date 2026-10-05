'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
type Review = {
    id: string;
    description: string;
    rating: number;
    users: string;
    created_at: string;
    book_id?: string | null;
};

const ReviewSection = () => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        try {
            const response=await fetch('/api/admin/reviews',{cache:'no-store'});
            const data=await response.json();
            if(!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
            setReviews(data.reviews || []);
        } catch(error) {
            console.error('Error fetching reviews:',error);
            toast({title:"Error",description:"Failed to fetch reviews. Please try again.",variant:"destructive"});
        }
    }

    async function handleDeleteReview(id: string) {
        const confirmed = window.confirm('Are you sure you want to delete this review?');
        if (!confirmed) return;

        const response = await fetch('/api/delete_review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            toast({
                variant: "destructive",
                title: "Error",
                description: data.error || "Something went wrong",
            });
            return;
        }

        toast({
            title: "Deleted",
            description: "Review deleted successfully.",
        });
        setReviews((current) => current.filter((review) => review.id !== id));
    }

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mb-6">
                        <h3 className="text-2xl font-semibold">Review Section</h3>
                        <p className="mt-1 text-sm text-slate-600">
                            Reviews are written by logged-in readers from individual book details. Admin can keep or delete them here.
                        </p>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Book</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>{review.id}</TableCell>
                                    <TableCell>{review.book_id || 'Existing homepage review'}</TableCell>
                                    <TableCell>{review.description}</TableCell>
                                    <TableCell>{review.rating}</TableCell>
                                    <TableCell>{review.users}</TableCell>
                                    <TableCell>{new Date(review.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" onClick={() => handleDeleteReview(review.id)}>
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

export default ReviewSection;
