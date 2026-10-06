"use client";

import { useState } from "react";
import Image from "next/image";
import logoPaths from "@/lib/company-logos.json";

export function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const src = (logoPaths as Record<string, string>)[company.trim().toLowerCase()];
  const initials = company.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500">
      {src && !failed ? (
        <Image src={src} alt="" width={28} height={28} unoptimized onError={() => setFailed(true)} className="h-7 w-7 object-contain" />
      ) : initials || "—"}
    </span>
  );
}
