"use client";

import { useState } from "react";
import Image from "next/image";
import logoPaths from "@/lib/company-logos.json";

// Match punctuation, accents, and spacing without guessing similarly named businesses.
const companyKey = (name: string) => name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const normalizedLogos = Object.fromEntries(Object.entries(logoPaths).map(([name, path]) => [companyKey(name), path]));

export function CompanyLogo({ company }: { company: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = normalizedLogos[companyKey(company)];
  const initials = company.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 text-xs font-bold text-slate-500 ${src === "/company-logos/riveron-com.png" && failedSrc !== src ? "bg-slate-900" : "bg-white"}`}>
      {src && failedSrc !== src ? (
        <Image src={src} alt="" width={28} height={28} unoptimized key={src} onError={() => setFailedSrc(src)} className="h-7 w-7 object-contain" />
      ) : initials || "—"}
    </span>
  );
}
