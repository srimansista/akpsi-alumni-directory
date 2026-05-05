import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        semester: true,
        isDraft: true,
        sentAt: true,
        sentCount: true,
        createdAt: true,
      },
    });
    return NextResponse.json(newsletters);
  } catch (err) {
    console.error("[GET /api/admin/newsletters]", err);
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
  }
}
