import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { alumniSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.alumni.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Alumni not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = alumniSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const alumni = await prisma.alumni.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(alumni);
  } catch (err) {
    console.error("[PUT /api/admin/alumni/[id]]", err);
    return NextResponse.json({ error: "Failed to update alumni" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.alumni.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Alumni not found" }, { status: 404 });
    }
    await prisma.alumni.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/alumni/[id]]", err);
    return NextResponse.json({ error: "Failed to delete alumni" }, { status: 500 });
  }
}
