"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AuthorsApproval() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);

  async function load() {
    const r = await fetch("/api/authors_approve", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setApplications(d.authors || []);
  }

  useEffect(() => { void load(); }, []);

  async function approve(applicationId: string) {
    const r = await fetch("/api/authors_approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: applicationId }),
    });
    const d = await r.json();
    if (!r.ok) {
      toast({ variant: "destructive", title: "Error", description: d.error });
      return;
    }
    toast({ title: "Approved", description: "Payment is now pending. The author will be registered after successful payment." });
    void load();
  }

  return (
    <div>
      <Toaster />
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <h3 className="text-2xl font-semibold mb-4">Authors Approvals</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.title} {a.full_name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.city}</TableCell>
                  <TableCell>{a.country}</TableCell>
                  <TableCell>{a.age}</TableCell>
                  <TableCell>{a.gender}</TableCell>
                  <TableCell>{a.country === "India" ? "UPI: " + (a.upi_number || "-") : "PayPal: " + (a.paypal_id || "-")}</TableCell>
                  <TableCell>{a.status === "approved_payment_pending" ? "Payment Pending" : a.status === "completed" ? "Registered Author" : a.status}</TableCell>
                  <TableCell>{a.created_at ? new Date(a.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : ""}</TableCell>
                  <TableCell>
                    {a.status === "completed" && a.author_id && <Button variant="destructive" onClick={async () => {
                      const r = await fetch("/api/delete_author", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ author_id: a.author_id }) });
                      const d = await r.json();
                      if (!r.ok) { toast({ variant: "destructive", title: "Unable to remove author", description: d.error }); return; }
                      toast({ title: "Author removed", description: "The registered author has been removed." });
                      void load();
                    }}>Remove Author</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
}
