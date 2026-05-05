"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

type Status = "ATTENDING" | "NOT_ATTENDING" | "MAYBE";

export default function EventRsvpForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("ATTENDING");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit RSVP");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="shadow-sm border-green-100">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold">RSVP Submitted!</p>
          <p className="text-gray-500 text-sm mt-1">
            Thanks for registering. See you there!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#1e3a5f] text-base">RSVP for This Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-name">Name</Label>
            <Input
              id="rsvp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-email">Email</Label>
            <Input
              id="rsvp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rsvp-status">Attendance</Label>
            <select
              id="rsvp-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ATTENDING">Attending</option>
              <option value="MAYBE">Maybe</option>
              <option value="NOT_ATTENDING">Not Attending</option>
            </select>
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
          >
            {loading ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
