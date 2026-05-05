import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { newsletterSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const newsletters = await prisma.newsletter.findMany({
      where: { isDraft: false },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(newsletters);
  } catch (err) {
    console.error("[GET /api/newsletters]", err);
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.create({ data: parsed.data });
    return NextResponse.json(newsletter, { status: 201 });
  } catch (err) {
    console.error("[POST /api/newsletters]", err);
    return NextResponse.json({ error: "Failed to create newsletter" }, { status: 500 });
  }
}
