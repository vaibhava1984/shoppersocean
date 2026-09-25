'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface User {
  id: string;
  email: string;
  full_name?: string;
  mobile?: string;
  userrole?: string;
}

const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong");
        setUsers(data.users || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Unable to load users",
        });
      }
    };
    fetchUsers();
  }, [toast]);

  return (
    <div>
      <Toaster />
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">Users</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>A_ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created/Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="text-black">
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.email || 'Email not available'}</TableCell>
                  <TableCell>{user.userrole || 'USER'}</TableCell>
                  <TableCell>{user.full_name || user.mobile || '—'}</TableCell>
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
