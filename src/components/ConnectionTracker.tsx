"use client";
import { useEffect, useState } from "react";
import { CONNECTION_LABELS, type ConnectionStatus } from "@/lib/connections";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function ConnectionSelect({ name, status, disabled, onChange }: {
  name: string; status: ConnectionStatus | null; disabled: boolean;
  onChange: (status: ConnectionStatus | null) => void;
}) {
  return <Select value={status ?? "unsaved"} disabled={disabled}
    onValueChange={value => onChange(value === "unsaved" ? null : value as ConnectionStatus)}>
    <SelectTrigger aria-label={`Contact status for ${name}`}
      className={`connection-select ${status === "TALKED_TO" ? "connection-talked" : status ? "connection-wanted" : ""}`}>
      <SelectValue/>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="unsaved">Not saved</SelectItem>
      {Object.entries(CONNECTION_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

export function ConnectionTracker({ alumniId, name }: { alumniId: string; name: string }) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/connections/${encodeURIComponent(alumniId)}`).then(async res => {
      if (!res.ok) throw new Error();
      return res.json();
    }).then(data => { if (active) { setStatus(data.status); setReady(true); } })
      .catch(() => { if (active) setError("Could not load your contact status. Refresh to try again."); });
    return () => { active = false; };
  }, [alumniId]);
  async function save(next: ConnectionStatus | null) {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/connections/${encodeURIComponent(alumniId)}`, {
        method: next ? "PATCH" : "DELETE", headers: { "Content-Type": "application/json" },
        ...(next ? { body: JSON.stringify({ status: next }) } : {}),
      });
      if (!res.ok) throw new Error();
      setStatus(next);
    } catch { setError("Could not save your contact status. Please try again."); }
    finally { setSaving(false); }
  }
  return <div className="profile-tracker"><p className="edition-label">MY CONNECTIONS</p>
    <ConnectionSelect name={name} status={status} disabled={!ready || saving} onChange={save}/>
    <p className="connection-private">Only you can see this status.</p>
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
