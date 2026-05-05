import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventRsvpSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const event = await prisma.event.findFirst({
      where: { id: params.id, isPublished: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = eventRsvpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, status } = parsed.data;

    // Try to link to an alumni record if one exists with this email
    const alumni = await prisma.alumni.findFirst({ where: { email } });

    const rsvp = await prisma.eventRSVP.upsert({
      where: { eventId_email: { eventId: params.id, email } },
      update: { name, status, alumniId: alumni?.id ?? null },
      create: {
        eventId: params.id,
        name,
        email,
        status,
        alumniId: alumni?.id ?? null,
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events/[id]/rsvp]", err);
    return NextResponse.json({ error: "Failed to submit RSVP" }, { status: 500 });
  }
}
