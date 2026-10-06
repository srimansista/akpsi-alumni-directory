import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { alumniUpdateSchema } from "@/lib/validations";

import { sendSubmissionNotification } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isApproved(session)) return NextResponse.json({error:"Unauthorized"},{status:401});
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
        alumniId: session!.user.alumniId,
      },
    });

    let notificationSent = false;
    try {
      await sendSubmissionNotification(submission);
      notificationSent = true;
    } catch (error) {
      // Preserve the pending update even if the email provider is unavailable.
      console.error("[submission notification]", error instanceof Error ? error.message : "Delivery failed");
    }

    return NextResponse.json({ id: submission.id, status: submission.status, notificationSent }, { status: 201 });
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
  if (!isApproved(session) || session?.user?.role !== "ADMIN") {
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
