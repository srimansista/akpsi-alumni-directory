import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { alumniSchema } from "@/lib/validations";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const alumnus = await prisma.alumni.findUnique({
      where: { id: params.id },
    });

    if (!alumnus) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(alumnus);
  } catch (err) {
    console.error("[GET /api/alumni/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch alumni" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.alumni.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = alumniSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.alumni.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        linkedInUrl: parsed.data.linkedInUrl || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/alumni/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update alumni" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.alumni.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.alumni.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/alumni/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete alumni" },
      { status: 500 }
    );
  }
}
