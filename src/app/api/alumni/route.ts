import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { alumniSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const gradYear = searchParams.get("gradYear");
  const industry = searchParams.get("industry");
  const willingToMentor = searchParams.get("willingToMentor");
  const sort = searchParams.get("sort") ?? "name-asc";

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { major: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (gradYear) {
      const yr = parseInt(gradYear);
      if (!isNaN(yr)) where.gradYear = yr;
    }

    if (industry) {
      where.industry = { equals: industry, mode: "insensitive" };
    }

    if (willingToMentor === "true") {
      where.willingToMentor = true;
    } else if (willingToMentor === "false") {
      where.willingToMentor = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: Record<string, any>;
    switch (sort) {
      case "year-desc":
        orderBy = { gradYear: "desc" };
        break;
      case "year-asc":
        orderBy = { gradYear: "asc" };
        break;
      case "company-asc":
        orderBy = { company: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      default:
        orderBy = { name: "asc" };
    }

    const alumni = await prisma.alumni.findMany({ where, orderBy });

    const result = alumni.map((a: typeof alumni[number]) => {
      if (!isAdmin) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { adminNotes: _adminNotes, ...rest } = a;
        return rest;
      }
      return a;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/alumni]", err);
    return NextResponse.json(
      { error: "Failed to fetch alumni" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = alumniSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const alumni = await prisma.alumni.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        linkedInUrl: parsed.data.linkedInUrl || null,
      },
    });

    return NextResponse.json(alumni, { status: 201 });
  } catch (err) {
    console.error("[POST /api/alumni]", err);
    return NextResponse.json(
      { error: "Failed to create alumni" },
      { status: 500 }
    );
  }
}
