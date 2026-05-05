import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  try {
    const events = await prisma.event.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { date: "asc" },
      include: { _count: { select: { rsvps: true } } },
    });
    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { date, endDate, ...rest } = parsed.data;
    const event = await prisma.event.create({
      data: {
        ...rest,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
