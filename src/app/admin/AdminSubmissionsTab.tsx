"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Submission {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  gradYear: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminSubmissionsTab() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function review(id: string, status: "APPROVED" | "REJECTED", applyToAlumni = false) {
    await fetch(`/api/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, applyToAlumni }),
    });
    fetchItems();
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#1e3a5f]">Pending Submissions ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-6">Loading submissions...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No pending submissions.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Grad Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email ?? "—"}</TableCell>
                    <TableCell>{s.company ?? "—"}</TableCell>
                    <TableCell>{s.gradYear ?? "—"}</TableCell>
                    <TableCell><Badge className="bg-amber-100 text-amber-700 border-amber-200">{s.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => review(s.id, "APPROVED", true)}>Approve & Apply</Button>
                        <Button size="sm" variant="outline" onClick={() => review(s.id, "APPROVED")}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => review(s.id, "REJECTED")}>Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
