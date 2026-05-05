"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Send, RefreshCw } from "lucide-react";

interface Newsletter {
  id: string;
  title: string;
  semester: string | null;
  isDraft: boolean;
  sentAt: string | null;
  sentCount: number;
  createdAt: string;
}

const emptyForm = {
  title: "",
  semester: "",
  chapterUpdates: "",
  brotherAchievements: "",
  alumniSpotlights: "",
  upcomingEvents: "",
  photosLinks: "",
  isDraft: true,
};

export default function AdminNewsletterTab() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Newsletter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Newsletter | null>(null);
  const [sendTarget, setSendTarget] = useState<Newsletter | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchNewsletters() {
    setLoading(true);
    try {
      // Fetch all newsletters (including drafts) from admin endpoint
      const res = await fetch("/api/admin/newsletters");
      if (res.ok) {
        setNewsletters(await res.json());
      } else {
        // Fallback to public endpoint
        const pub = await fetch("/api/newsletters");
        if (pub.ok) setNewsletters(await pub.json());
      }
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNewsletters();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  async function openEdit(nl: Newsletter) {
    const detail = await fetch(`/api/newsletters/${nl.id}`).then((r) =>
      r.ok ? r.json() : null
    );
    setEditTarget(nl);
    setForm({
      title: detail?.title ?? nl.title,
      semester: detail?.semester ?? nl.semester ?? "",
      chapterUpdates: detail?.chapterUpdates ?? "",
      brotherAchievements: detail?.brotherAchievements ?? "",
      alumniSpotlights: detail?.alumniSpotlights ?? "",
      upcomingEvents: detail?.upcomingEvents ?? "",
      photosLinks: detail?.photosLinks ?? "",
      isDraft: detail?.isDraft ?? nl.isDraft,
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title,
        semester: form.semester || null,
        chapterUpdates: form.chapterUpdates || null,
        brotherAchievements: form.brotherAchievements || null,
        alumniSpotlights: form.alumniSpotlights || null,
        upcomingEvents: form.upcomingEvents || null,
        photosLinks: form.photosLinks || null,
        isDraft: form.isDraft,
      };

      const res = editTarget
        ? await fetch(`/api/newsletters/${editTarget.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/newsletters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setFormOpen(false);
      fetchNewsletters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!sendTarget) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/newsletters/${sendTarget.id}/send`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSendResult(
          `Sent to ${data.sentCount} recipients. ${data.failedCount ? `${data.failedCount} failed.` : ""}`
        );
        fetchNewsletters();
      } else {
        setSendResult(`Error: ${data.error}`);
      }
    } catch {
      setSendResult("Failed to send newsletter.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/newsletters/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchNewsletters();
    } catch {
      // swallow
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1e3a5f]">
            Newsletters ({newsletters.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={fetchNewsletters} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              className="bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Newsletter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
          ) : newsletters.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No newsletters yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletters.map((nl) => (
                    <TableRow key={nl.id}>
                      <TableCell className="font-medium">{nl.title}</TableCell>
                      <TableCell className="text-gray-600">{nl.semester ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            nl.isDraft
                              ? "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                          }
                        >
                          {nl.isDraft ? "Draft" : "Published"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {nl.sentAt
                          ? new Date(nl.sentAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-gray-600">{nl.sentCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!nl.isDraft && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-blue-500 hover:text-blue-700"
                              title="Send newsletter"
                              onClick={() => {
                                setSendTarget(nl);
                                setSendResult(null);
                              }}
                            >
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(nl)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(nl)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {editTarget ? "Edit Newsletter" : "New Newsletter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Newsletter title"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Input
                  value={form.semester}
                  onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                  placeholder="e.g. Fall 2024"
                />
              </div>
            </div>
            {(
              [
                ["chapterUpdates", "Chapter Updates"],
                ["brotherAchievements", "Brother Achievements"],
                ["alumniSpotlights", "Alumni Spotlights"],
                ["upcomingEvents", "Upcoming Events"],
                ["photosLinks", "Photos & Links"],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Textarea
                  value={form[field]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  rows={3}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                id="isDraft"
                type="checkbox"
                checked={!form.isDraft}
                onChange={(e) => setForm((f) => ({ ...f, isDraft: !e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isDraft">Publish (uncheck to save as draft)</Label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={saving || !form.title}
              onClick={handleSave}
            >
              {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Newsletter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Confirm Dialog */}
      <Dialog
        open={!!sendTarget}
        onOpenChange={(open) => {
          if (!open) { setSendTarget(null); setSendResult(null); }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Send Newsletter</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Send <strong>{sendTarget?.title}</strong> to all subscribed alumni? This action
            cannot be undone.
          </p>
          {sendResult && (
            <p
              className={`text-sm mt-2 ${sendResult.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}
            >
              {sendResult}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setSendTarget(null); setSendResult(null); }}
            >
              {sendResult ? "Close" : "Cancel"}
            </Button>
            {!sendResult && (
              <Button
                className="flex-1 bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
                disabled={sending}
                onClick={handleSend}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {sending ? "Sending..." : "Send Now"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Newsletter</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
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
