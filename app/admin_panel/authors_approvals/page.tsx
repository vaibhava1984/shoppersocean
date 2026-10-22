"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AuthorsApproval() {
  const [applications, setApplications] = useState<any[]>([]);
  async function load() {
    const r = await fetch("/api/authors_approve", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setApplications(d.authors || []);
  }
  useEffect(() => { void load(); }, []);

  return (
    <div>
      <Toaster />
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <h3 className="text-2xl font-semibold mb-4">Authors Approvals — Payment Pending</h3>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>City</TableHead>
              <TableHead>Country</TableHead><TableHead>Age</TableHead><TableHead>Gender</TableHead>
              <TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead>Approved At</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.title} {a.full_name}</TableCell>
                  <TableCell>{a.email}</TableCell><TableCell>{a.city}</TableCell>
                  <TableCell>{a.country}</TableCell><TableCell>{a.age}</TableCell><TableCell>{a.gender}</TableCell>
                  <TableCell>{a.payment_currency || (a.country === "India" ? "INR" : "USD")}</TableCell>
                  <TableCell><Button disabled className="bg-green-600 text-white opacity-100 hover:bg-green-600">Pending</Button></TableCell>
                  <TableCell>{a.approved_at ? new Date(a.approved_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : ""}</TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-gray-500 py-8">No author registrations are currently awaiting payment.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}