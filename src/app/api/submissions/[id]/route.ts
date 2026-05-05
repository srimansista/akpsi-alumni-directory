import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const updateSubmissionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  /** If provided and status is APPROVED, upsert the alumni record */
  applyToAlumni: z.boolean().optional().default(false),
  /** Existing alumni ID to update (optional; if not provided and applyToAlumni=true, creates new) */
  alumniId: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const submission = await prisma.alumniUpdateSubmission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, applyToAlumni, alumniId } = parsed.data;
    const reviewedBy = session.user?.email ?? session.user?.id ?? "admin";

    // Perform alumni upsert if approved and requested
    let targetAlumniId: string | null = alumniId ?? submission.alumniId ?? null;

    if (status === "APPROVED" && applyToAlumni) {
      const alumniData = {
        name: submission.name,
        gradYear: submission.gradYear,
        email: submission.email,
        linkedInUrl: submission.linkedInUrl,
        company: submission.company,
        role: submission.role,
        major: submission.major,
        location: submission.location,
        industry: submission.industry,
        willingToMentor: submission.willingToMentor,
        willingToSpeak: submission.willingToSpeak,
        notes: submission.notes,
      };

      if (targetAlumniId) {
        // Update existing alumni
        const exists = await prisma.alumni.findUnique({
          where: { id: targetAlumniId },
        });
        if (exists) {
          await prisma.alumni.update({
            where: { id: targetAlumniId },
            data: alumniData,
          });
        } else {
          // The referenced alumni no longer exists — create a new one
          const created = await prisma.alumni.create({ data: alumniData });
          targetAlumniId = created.id;
        }
      } else {
        // No existing alumni linked — create one
        const created = await prisma.alumni.create({ data: alumniData });
        targetAlumniId = created.id;
      }
    }

    // Update submission status
    const updated = await prisma.alumniUpdateSubmission.update({
      where: { id: params.id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        alumniId: targetAlumniId,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/submissions/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
