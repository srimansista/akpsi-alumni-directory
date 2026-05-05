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
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  rsvpLink: string | null;
  audience: string[];
  isPublished: boolean;
  _count?: { rsvps: number };
}

const emptyForm = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  location: "",
  rsvpLink: "",
  audience: "",
  isPublished: false,
};

export default function AdminEventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(event: Event) {
    setEditTarget(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      date: event.date.slice(0, 16),
      endDate: event.endDate ? event.endDate.slice(0, 16) : "",
      location: event.location ?? "",
      rsvpLink: event.rsvpLink ?? "",
      audience: event.audience.join(", "),
      isPublished: event.isPublished,
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
        description: form.description || null,
        date: form.date,
        endDate: form.endDate || null,
        location: form.location || null,
        rsvpLink: form.rsvpLink || null,
        audience: form.audience
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isPublished: form.isPublished,
      };

      const res = editTarget
        ? await fetch(`/api/events/${editTarget.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setFormOpen(false);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/events/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchEvents();
    } catch {
      // swallow
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1e3a5f]">Events ({events.length})</CardTitle>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={fetchEvents} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              className="bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No events yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>RSVPs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-medium">{ev.title}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(ev.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{ev.location ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {ev.audience.map((a) => (
                            <Badge key={a} variant="outline" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ev.isPublished
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                              : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                          }
                        >
                          {ev.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {ev._count?.rsvps ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEdit(ev)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(ev)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">
              {editTarget ? "Edit Event" : "New Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date &amp; Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. 2100 Van Munching Hall"
              />
            </div>
            <div className="space-y-1.5">
              <Label>External RSVP Link</Label>
              <Input
                value={form.rsvpLink}
                onChange={(e) => setForm((f) => ({ ...f, rsvpLink: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Audience (comma-separated)</Label>
              <Input
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                placeholder="Alumni, Current Brothers"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isPublished">Publish immediately</Label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={saving || !form.title || !form.date}
              onClick={handleSave}
            >
              {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? All RSVPs
            will also be deleted.
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
