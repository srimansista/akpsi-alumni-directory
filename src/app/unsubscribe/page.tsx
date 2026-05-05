"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    setEmail(url.searchParams.get("email") ?? "");
  }, []);

  async function handleUnsubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to unsubscribe");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f]">Unsubscribe from Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!email ? (
            <p className="text-sm text-red-600">Invalid unsubscribe link.</p>
          ) : done ? (
            <p className="text-sm text-green-700">
              {email} has been unsubscribed from future alumni newsletters.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Confirm unsubscribe for <span className="font-medium">{email}</span>.
              </p>
              <Button onClick={handleUnsubscribe} disabled={loading}>
                {loading ? "Processing..." : "Confirm Unsubscribe"}
              </Button>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
