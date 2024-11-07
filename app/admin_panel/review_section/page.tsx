'use client';
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminSidebar from "../adminSidebar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from '@/utils/supabase/client'
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


// Initialize Supabase client
const supabase = createClient()

type Review = {
    id: string;
    description: string;
    rating: number;
    users: string;
    created_at: string;
};

const ReviewSection = () => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState<Review | null>(null);
    const [newReview, setNewReview] = useState({
        description: '',
        rating: 0,
        users: '',
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            toast({
                title: "Error",
                description: "Failed to fetch reviews. Please try again.",
                variant: "destructive",
            });
        } else {
            setReviews(data || []);
        }
    }

    async function handleAddReview() {
        if (newReview.description && newReview.rating && newReview.users) {
            const response = await fetch('/api/insert_reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description: newReview.description, rating: newReview.rating, users: newReview.users }),
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
                description: "Added Review Successfully",
            })
            setIsAddDialogOpen(false);
            setNewReview({ description: '', rating: 0, users: '' });
            fetchReviews();
        } else {
            alert("Please fill all the fields")
        }
    }

    async function handleUpdateReview() {

        if (!currentReview) return;

        const response = await fetch('/api/update_review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentReview }),
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
            description: "updated Review Successfully",
        })
        setIsEditDialogOpen(false);
        setCurrentReview(null);
        fetchReviews();


        ///////
        // if (!currentReview) return;


        // const { error } = await supabase
        //     .from('testimonials')
        //     .update(currentReview)
        //     .eq('id', currentReview.id);

        // if (error) {
        //     console.error('Error updating review:', error);
        //     toast({
        //         title: "Error",
        //         description: "Failed to update review. Please try again.",
        //         variant: "destructive",
        //     });
        // } else {
        //     toast({
        //         title: "Success",
        //         description: "Review updated successfully.",
        //     });
        //     setIsEditDialogOpen(false);
        //     setCurrentReview(null);
        //     fetchReviews();
        // }
    }

    async function handleDeleteReview(id: string) {

        const response = await fetch('/api/delete_review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
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
            description: "Deleted Review Successfully",
        })
        fetchReviews();
    }

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold">Review Section</h3>
                        <Button onClick={() => setIsAddDialogOpen(true)}>Add Review</Button>
                    </div>


                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
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
                                    <TableCell>{review.description}</TableCell>
                                    <TableCell>{review.rating}</TableCell>
                                    <TableCell>{review.users}</TableCell>
                                    <TableCell>{new Date(review.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" className="mr-2" onClick={() => {
                                            setCurrentReview(review);
                                            setIsEditDialogOpen(true);
                                        }}>
                                            Edit
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Add Review Dialog */}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Review</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        className="col-span-3"
                                        value={newReview.description}
                                        onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="rating" className="text-right">
                                        Rating
                                    </Label>
                                    <Input
                                        id="rating"
                                        type="number"
                                        className="col-span-3"
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="user" className="text-right">
                                        User
                                    </Label>
                                    <Input
                                        id="user"
                                        className="col-span-3"
                                        value={newReview.users}
                                        onChange={(e) => setNewReview({ ...newReview, users: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddReview}>Add Review</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Review Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Review</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="edit-description"
                                        className="col-span-3"
                                        value={currentReview?.description || ''}
                                        onChange={(e) => setCurrentReview(currentReview ? { ...currentReview, description: e.target.value } : null)}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-rating" className="text-right">
                                        Rating
                                    </Label>
                                    <Input
                                        id="edit-rating"
                                        type="number"
                                        className="col-span-3"
                                        value={currentReview?.rating || 0}
                                        onChange={(e) => setCurrentReview(currentReview ? { ...currentReview, rating: Number(e.target.value) } : null)}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-user" className="text-right">
                                        User
                                    </Label>
                                    <Input
                                        id="edit-user"
                                        className="col-span-3"
                                        value={currentReview?.users || ''}
                                        onChange={(e) => setCurrentReview(currentReview ? { ...currentReview, users: e.target.value } : null)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUpdateReview}>Update Review</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
};

export default ReviewSection;
