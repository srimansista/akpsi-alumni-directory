import { prisma } from "@/lib/prisma";
import { DirectoryClient } from "./DirectoryClient";
import type { AlumnusRecord } from "./DirectoryClient";
import { promises as fs } from "node:fs";
import path from "node:path";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

interface CsvAlumnus {
  First?: string;
  Last?: string;
  Email?: string;
  "Grad Year"?: string | number;
  Company?: string;
  Major?: string;
  LinkedIn?: string;
  name?: string;
  gradYear?: string | number;
  email?: string;
  linkedInUrl?: string;
  company?: string;
  role?: string;
  major?: string;
  location?: string;
  industry?: string;
  willingToMentor?: string | boolean;
  willingToSpeak?: string | boolean;
  notes?: string;
}

function toBool(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  return String(value ?? "").toLowerCase() === "true" || String(value ?? "") === "1";
}

function toNullable(value?: string | null): string | null {
  const v = value?.trim();
  return v ? v : null;
}

async function getAlumniFromCsv(): Promise<AlumnusRecord[]> {
  const base = path.join(process.cwd(), "data");
  const candidates = [
    path.join(base, "Alumni Master List - Alumni Info.csv"),
    path.join(base, "alumni-import.csv"),
  ];

  let file = "";
  for (const candidate of candidates) {
    try {
      file = await fs.readFile(candidate, "utf8");
      if (file.trim()) break;
    } catch {
      // try next candidate
    }
  }
  if (!file.trim()) return [];

  const parsed = Papa.parse<CsvAlumnus>(file, { header: true, skipEmptyLines: true });
  const now = new Date();
  const seen = new Set<string>();

  const rows: AlumnusRecord[] = [];
  parsed.data.forEach((row, idx) => {
      const fallbackName = `${toNullable(row.First) ?? ""} ${toNullable(row.Last) ?? ""}`.trim();
      const combinedName = toNullable(row.name) ?? (fallbackName || null);
      const email = toNullable(row.email ?? row.Email)?.toLowerCase() ?? null;
      const gradYearRaw = row.gradYear ?? row["Grad Year"];
      const gradYear = gradYearRaw ? Number(gradYearRaw) : null;
      const dedupeKey = email ?? `${combinedName ?? "unknown"}-${gradYear ?? "na"}`;
      if (!combinedName || seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      rows.push({
        id: email ?? `csv-${combinedName.toLowerCase().replace(/\s+/g, "-")}-${gradYear ?? "na"}-${idx}`,
        name: combinedName,
        gradYear: Number.isFinite(gradYear) ? gradYear : null,
        email,
        linkedInUrl: toNullable(row.linkedInUrl ?? row.LinkedIn),
        company: toNullable(row.company ?? row.Company),
        role: toNullable(row.role),
        major: toNullable(row.major ?? row.Major),
        location: toNullable(row.location),
        industry: toNullable(row.industry),
        willingToMentor: toBool(row.willingToMentor),
        willingToSpeak: toBool(row.willingToSpeak),
        notes: toNullable(row.notes),
        adminNotes: null,
        unsubscribed: false,
        createdAt: now,
        updatedAt: now,
      });
    });

  return rows;
}

async function getAlumni(): Promise<AlumnusRecord[]> {
  try {
    return await prisma.alumni.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return getAlumniFromCsv();
  }
}

export default async function DirectoryPage() {
  const alumni = await getAlumni();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Alumni Directory
          </h1>
          <p className="text-gray-300 text-lg">
            Connect with AKPsi Omega Theta alumni across the country.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DirectoryClient alumni={alumni} />
      </div>
    </div>
  );
}
