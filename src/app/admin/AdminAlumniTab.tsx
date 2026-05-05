"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload, RefreshCw, Pencil, Trash2, AlertTriangle } from "lucide-react";

interface Alumni {
  id: string;
  name: string;
  email: string | null;
  gradYear: number | null;
  company: string | null;
  linkedInUrl?: string | null;
  role: string | null;
  location: string | null;
  industry: string | null;
  willingToMentor: boolean;
  willingToSpeak: boolean;
  unsubscribed: boolean;
  createdAt: string;
}

interface CsvRow {
  name?: string;
  email?: string;
  gradYear?: string;
  company?: string;
  role?: string;
  major?: string;
  location?: string;
  industry?: string;
  linkedInUrl?: string;
  willingToMentor?: string;
  willingToSpeak?: string;
  notes?: string;
}

export default function AdminAlumniTab() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Alumni | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Alumni | null>(null);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvDuplicates, setCsvDuplicates] = useState<number>(0);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Alumni>>({});
  const [saving, setSaving] = useState(false);
  const [dataQuality, setDataQuality] = useState({
    missingEmail: 0,
    missingLinkedIn: 0,
    missingCompany: 0,
    duplicateNames: 0,
    duplicateEmails: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchAlumni() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alumni");
      if (res.ok) setAlumni(await res.json());
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    const byName = new Map<string, number>();
    const byEmail = new Map<string, number>();
    let missingEmail = 0;
    let missingCompany = 0;
    let missingLinkedIn = 0;

    for (const a of alumni) {
      if (!a.email?.trim()) missingEmail++;
      if (!a.company?.trim()) missingCompany++;
      if (!a.linkedInUrl?.trim()) missingLinkedIn++;
      const name = a.name.trim().toLowerCase();
      byName.set(name, (byName.get(name) ?? 0) + 1);
      if (a.email?.trim()) {
        const email = a.email.trim().toLowerCase();
        byEmail.set(email, (byEmail.get(email) ?? 0) + 1);
      }
    }

    setDataQuality({
      missingEmail,
      missingCompany,
      missingLinkedIn,
      duplicateNames: Array.from(byName.values()).filter((count) => count > 1).length,
      duplicateEmails: Array.from(byEmail.values()).filter((count) => count > 1).length,
    });
  }, [alumni]);

  const filtered = alumni.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCsvUpload(file: File) {
    setCsvLoading(true);
    setCsvStatus(null);
    try {
      const text = await file.text();
      const parsed = Papa.parse<CsvRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
      });
      const rows = parsed.data.filter((row) => row.name?.trim());
      if (!rows.length) {
        setCsvStatus("CSV has no valid data rows.");
        return;
      }

      const known = new Set(
        alumni
          .map((a) => (a.email ? `email:${a.email.trim().toLowerCase()}` : ""))
          .filter(Boolean)
      );
      let dupes = 0;
      for (const row of rows) {
        if (row.email && known.has(`email:${row.email.trim().toLowerCase()}`)) {
          dupes++;
        }
      }

      setCsvRows(rows);
      setCsvDuplicates(dupes);
      setCsvDialogOpen(true);
    } catch {
      setCsvStatus("Failed to process CSV.");
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleConfirmImport() {
    setCsvLoading(true);
    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(csvRows),
      });
      const data = await res.json();
      if (!res.ok) {
        setCsvStatus(`Error: ${data.error ?? "Import failed"}`);
        return;
      }
      setCsvStatus(`Import complete: ${data.imported} created, ${data.updated} updated, ${data.skipped} skipped.`);
      setCsvDialogOpen(false);
      setCsvRows([]);
      fetchAlumni();
    } finally {
      setCsvLoading(false);
    }
  }

  function openEdit(alumnus: Alumni) {
    setEditTarget(alumnus);
    setForm(alumnus);
  }

  async function handleSaveEdit() {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gradYear: form.gradYear ? Number(form.gradYear) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setEditTarget(null);
      fetchAlumni();
    } catch (err) {
      setCsvStatus(err instanceof Error ? `Error: ${err.message}` : "Error: Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function exportCsv() {
    const rows = alumni.map((a) => ({
      name: a.name,
      email: a.email ?? "",
      gradYear: a.gradYear ?? "",
      company: a.company ?? "",
      role: a.role ?? "",
      location: a.location ?? "",
      industry: a.industry ?? "",
      willingToMentor: a.willingToMentor,
      willingToSpeak: a.willingToSpeak,
      unsubscribed: a.unsubscribed,
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "akpsi-alumni-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/admin/alumni/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchAlumni();
    } catch {
      // swallow
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Missing Email</p><p className="text-xl font-semibold">{dataQuality.missingEmail}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Missing LinkedIn</p><p className="text-xl font-semibold">{dataQuality.missingLinkedIn}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Missing Company</p><p className="text-xl font-semibold">{dataQuality.missingCompany}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Duplicate Names</p><p className="text-xl font-semibold">{dataQuality.duplicateNames}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500">Duplicate Emails</p><p className="text-xl font-semibold">{dataQuality.duplicateEmails}</p></CardContent></Card>
      </div>

      {/* CSV Import */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
            <Upload className="w-4 h-4" /> CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm mb-4">
            Upload a CSV file with columns: <code className="bg-gray-100 px-1 rounded text-xs">name, email, gradYear, company, role, major, location, industry, linkedInUrl, willingToMentor, willingToSpeak, notes</code>
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={csvLoading}
              className="bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
            >
              <Upload className="w-4 h-4 mr-2" />
              {csvLoading ? "Importing..." : "Upload CSV"}
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {csvStatus && (
              <span
                className={`text-sm ${csvStatus.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}
              >
                {csvStatus}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alumni Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-[#1e3a5f]">
            Alumni ({filtered.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={fetchAlumni}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Loading alumni...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No alumni found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grad Year</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{a.email ?? "—"}</TableCell>
                      <TableCell className="text-gray-600">{a.gradYear ?? "—"}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{a.company ?? "—"}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{a.location ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {a.willingToMentor && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Mentor</Badge>
                          )}
                          {a.willingToSpeak && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Speak</Badge>
                          )}
                          {a.unsubscribed && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Unsub</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(a)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              Edit Alumni: {editTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Input value={form.company ?? ""} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Grad Year</Label>
                <Input type="number" value={form.gradYear ?? ""} onChange={(e) => setForm((f) => ({ ...f, gradYear: Number(e.target.value) || null }))} />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Input value={form.role ?? ""} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={form.location ?? ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.willingToMentor} onCheckedChange={(c) => setForm((f) => ({ ...f, willingToMentor: !!c }))} />
                <Label>Mentor</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.willingToSpeak} onCheckedChange={(c) => setForm((f) => ({ ...f, willingToSpeak: !!c }))} />
                <Label>Speaker</Label>
              </div>
            </div>
            <Button className="w-full bg-[#1e3a5f] text-white hover:bg-[#162d4a]" disabled={saving} onClick={handleSaveEdit}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview CSV Import</DialogTitle>
            <DialogDescription>
              {csvRows.length} rows detected. Potential email duplicates: {csvDuplicates}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Grad Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvRows.slice(0, 20).map((row, idx) => (
                  <TableRow key={`${row.email}-${idx}`}>
                    <TableCell>{row.name ?? "—"}</TableCell>
                    <TableCell>{row.email ?? "—"}</TableCell>
                    <TableCell>{row.company ?? "—"}</TableCell>
                    <TableCell>{row.gradYear ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Showing first 20 rows in preview.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#1e3a5f] text-white hover:bg-[#162d4a]" onClick={handleConfirmImport} disabled={csvLoading}>
              {csvLoading ? "Importing..." : "Confirm Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Alumni</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
