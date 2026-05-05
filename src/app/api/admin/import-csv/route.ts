import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface AlumniRow {
  name?: string;
  email?: string;
  gradYear?: string | number;
  company?: string;
  role?: string;
  major?: string;
  location?: string;
  industry?: string;
  linkedInUrl?: string;
  willingToMentor?: boolean | string;
  willingToSpeak?: boolean | string;
  notes?: string;
}

function parseBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return false;
}

function parseYear(val: unknown): number | null {
  if (!val) return null;
  const n = Number(val);
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of alumni rows" },
        { status: 400 }
      );
    }

    const rows = body as AlumniRow[];
    let imported = 0;
    let updated = 0;
    const skipped: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name?.trim()) {
        skipped.push(i);
        continue;
      }

      const data = {
        name: row.name.trim(),
        email: row.email?.trim() || null,
        gradYear: parseYear(row.gradYear),
        company: row.company?.trim() || null,
        role: row.role?.trim() || null,
        major: row.major?.trim() || null,
        location: row.location?.trim() || null,
        industry: row.industry?.trim() || null,
        linkedInUrl: row.linkedInUrl?.trim() || null,
        willingToMentor: parseBool(row.willingToMentor),
        willingToSpeak: parseBool(row.willingToSpeak),
        notes: row.notes?.trim() || null,
      };

      if (data.email) {
        // Upsert by email
        const existing = await prisma.alumni.findFirst({
          where: { email: data.email },
        });
        if (existing) {
          await prisma.alumni.update({ where: { id: existing.id }, data });
          updated++;
        } else {
          await prisma.alumni.create({ data });
          imported++;
        }
      } else {
        // No email — always create
        await prisma.alumni.create({ data });
        imported++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      skipped: skipped.length,
      total: imported + updated,
    });
  } catch (err) {
    console.error("[POST /api/admin/import-csv]", err);
    return NextResponse.json({ error: "Failed to import alumni" }, { status: 500 });
  }
}
