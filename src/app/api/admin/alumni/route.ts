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
    const alumni = await prisma.alumni.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        gradYear: true,
        company: true,
        linkedInUrl: true,
        role: true,
        location: true,
        industry: true,
        willingToMentor: true,
        willingToSpeak: true,
        unsubscribed: true,
        createdAt: true,
      },
    });
    return NextResponse.json(alumni);
  } catch (err) {
    console.error("[GET /api/admin/alumni]", err);
    return NextResponse.json({ error: "Failed to fetch alumni" }, { status: 500 });
  }
}
