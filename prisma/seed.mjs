import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toBool(v) {
  return String(v ?? "").toLowerCase() === "true" || String(v ?? "") === "1";
}

function toYear(v) {
  const num = Number(v);
  if (!Number.isInteger(num) || num < 1900 || num > 2100) return null;
  return num;
}

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), "prisma", "seed-alumni.csv");
  if (!fs.existsSync(file)) {
    console.log(`Seed CSV not found at ${file}. Skipping import.`);
    return;
  }

  const csv = fs.readFileSync(file, "utf8");
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  let created = 0;
  let updated = 0;

  for (const row of parsed.data) {
    const name = row.name?.trim();
    if (!name) continue;
    const email = row.email?.trim() || null;
    const payload = {
      name,
      gradYear: toYear(row.gradYear),
      company: row.company?.trim() || null,
      role: row.role?.trim() || null,
      email,
      linkedInUrl: row.linkedInUrl?.trim() || null,
      major: row.major?.trim() || null,
      location: row.location?.trim() || null,
      industry: row.industry?.trim() || null,
      willingToMentor: toBool(row.willingToMentor),
      willingToSpeak: toBool(row.willingToSpeak),
      notes: row.notes?.trim() || null,
    };

    if (email) {
      const existing = await prisma.alumni.findFirst({ where: { email } });
      if (existing) {
        await prisma.alumni.update({ where: { id: existing.id }, data: payload });
        updated++;
      } else {
        await prisma.alumni.create({ data: payload });
        created++;
      }
    } else {
      await prisma.alumni.create({ data: payload });
      created++;
    }
  }

  console.log(`Seed complete. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
