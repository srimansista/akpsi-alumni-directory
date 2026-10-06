import { prisma } from "@/lib/prisma";
export async function getAlumni() {
  const records = await prisma.alumni.findMany({ orderBy: { name: "asc" } });
  return records.map(record => ({ ...record, adminNotes: null }));
}
