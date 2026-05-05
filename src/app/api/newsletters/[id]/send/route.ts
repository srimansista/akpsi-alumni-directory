import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: params.id },
    });
    if (!newsletter) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }
    if (newsletter.isDraft) {
      return NextResponse.json(
        { error: "Cannot send a draft newsletter" },
        { status: 400 }
      );
    }

    // Get all alumni with an email who haven't unsubscribed
    const recipients = await prisma.alumni.findMany({
      where: { email: { not: null }, unsubscribed: false },
      select: { id: true, name: true, email: true },
    });

    const appUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    let sentCount = 0;
    const errors: string[] = [];

    for (const alumni of recipients) {
      if (!alumni.email) continue;
      try {
        await sendNewsletterEmail({
          to: alumni.email,
          name: alumni.name,
          title: newsletter.title,
          semester: newsletter.semester,
          chapterUpdates: newsletter.chapterUpdates,
          brotherAchievements: newsletter.brotherAchievements,
          alumniSpotlights: newsletter.alumniSpotlights,
          upcomingEvents: newsletter.upcomingEvents,
          photosLinks: newsletter.photosLinks,
          unsubscribeUrl: `${appUrl}/unsubscribe?email=${encodeURIComponent(alumni.email)}`,
        });

        // Upsert NewsletterRecipient record
        await prisma.newsletterRecipient.upsert({
          where: {
            newsletterId_email: { newsletterId: params.id, email: alumni.email },
          },
          update: { sentAt: new Date() },
          create: {
            newsletterId: params.id,
            alumniId: alumni.id,
            email: alumni.email,
            name: alumni.name,
            sentAt: new Date(),
          },
        });

        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${alumni.email}:`, err);
        errors.push(alumni.email);
      }
    }

    // Update newsletter sentAt + sentCount
    await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        sentAt: new Date(),
        sentCount: { increment: sentCount },
      },
    });

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount: errors.length,
      failedEmails: errors,
    });
  } catch (err) {
    console.error("[POST /api/newsletters/[id]/send]", err);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
