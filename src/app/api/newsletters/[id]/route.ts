import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { newsletterSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
    });
    if (!newsletter) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }
    return NextResponse.json(newsletter);
  } catch (err) {
    console.error("[GET /api/newsletters/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch newsletter" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.newsletter.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(newsletter);
  } catch (err) {
    console.error("[PUT /api/newsletters/[id]]", err);
    return NextResponse.json({ error: "Failed to update newsletter" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.newsletter.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }
    await prisma.newsletter.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/newsletters/[id]]", err);
    return NextResponse.json({ error: "Failed to delete newsletter" }, { status: 500 });
  }
}
