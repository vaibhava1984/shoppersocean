'use client';
import React, { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface UserMetadata {
    name?: string;
    full_name?: string;
    territory?: string;
    avatar_url?: string;
    [key: string]: any;
}

interface AppMetadata {
    provider: string;
    roles?: string[];
    [key: string]: any;
}

interface User {
    id: string;
    email: string;
    phone?: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    app_metadata: AppMetadata;
    user_metadata: UserMetadata;
    confirmed_at?: string; // ISO date string
    last_sign_in_at?: string; // ISO date string
    email_confirmed?: boolean;
}


const UsersManagement = () => {
    const { toast } = useToast()
    const [allUsersLists, setAllUsersLists] = useState<User[]>([]);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        const response = await fetch('/api/all_users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();
        // console.log("data usersah?=>", data)

        if (!response.ok) {
            toast({
                variant: "destructive",
                title: "Error",
                description: data.error || "Something went wrong",
            })
            return;
        } else {
            setAllUsersLists(data.users)
        }
    };

    // const handleDeleteUser = async (author_id: string, user_id: string) => {

    //     const response = await fetch('/api/delete_author', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ author_id: author_id, user_id }),
    //     });

    //     const data = await response.json();

    //     if (!response.ok) {
    //         toast({
    //             variant: "destructive",
    //             title: "Error",
    //             description: data.error || "Something went wrong",
    //         })
    //         return;
    //     }

    //     toast({
    //         title: "Delete!",
    //         description: "Deleted Author Successfully",
    //     })
    // };

    return (
        <div>
            <Toaster />
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold">Users</h3>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created On</TableHead>
                                <TableHead>Territory</TableHead>
                                {/* <TableHead>Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allUsersLists.filter(d => d).map((allUser) => (
                                <TableRow key={allUser.id} className='text-black'>
                                    <TableCell className="max-w-[180px] whitespace-normal break-words font-medium">{allUser.user_metadata?.full_name || allUser.user_metadata?.name || "Name not available"}</TableCell>
                                    <TableCell className="font-medium">
                                        {allUser.email || allUser.user_metadata?.email || 'Email not available'}
                                    </TableCell>
                                    <TableCell>{allUser.app_metadata.userrole || 'N/A'}</TableCell>
                                    <TableCell>{new Date(allUser.created_at).toLocaleString()}</TableCell>
                                    <TableCell className="min-w-[140px] whitespace-normal break-words">{allUser.user_metadata?.territory || allUser.user_metadata?.country || "Not provided"}</TableCell>
                                    {/* <TableCell>
                                        <Button variant="destructive" onClick={() => { }}>
                                            Delete
                                        </Button>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </main>
            </div>
        </div>
    );
};

export default UsersManagement;
