import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const Users = () => {
    const users = [
        { name: 'Alice Johnson', email: 'alice@example.com', joined: '2023-09-15', lastLogged: '2023-10-23', active: true, role: 'User' },
        { name: 'Bob Smith', email: 'bob@example.com', joined: '2023-09-20', lastLogged: '2023-10-22', active: true, role: 'Admin' },
        { name: 'Charlie Brown', email: 'charlie@example.com', joined: '2023-09-25', lastLogged: '2023-10-21', active: false, role: 'User' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Registered Users</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Last Logged Date</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={index}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.joined}</TableCell>
                            <TableCell>{user.lastLogged}</TableCell>
                            <TableCell>{user.active ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{user.role}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Users;
