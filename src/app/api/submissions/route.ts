import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { alumniUpdateSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = alumniUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const submission = await prisma.alumniUpdateSubmission.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        linkedInUrl: parsed.data.linkedInUrl || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions]", err);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const submissions = await prisma.alumniUpdateSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
