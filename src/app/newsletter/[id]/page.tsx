export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Newspaper, CalendarDays, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getNewsletter(id: string) {
  try {
    return await prisma.newsletter.findFirst({
      where: { id, isDraft: false },
    });
  } catch {
    return null;
  }
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NewsletterSection({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <section>
      <h2 className="text-xl font-bold text-[#1e3a5f] mb-1 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#c9a84c] rounded-full inline-block" />
        {title}
      </h2>
      <Separator className="mb-4" />
      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
        {content}
      </div>
    </section>
  );
}

export default async function NewsletterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const newsletter = await getNewsletter(params.id);
  if (!newsletter) notFound();

  const hasSections =
    newsletter.chapterUpdates ||
    newsletter.brotherAchievements ||
    newsletter.alumniSpotlights ||
    newsletter.upcomingEvents ||
    newsletter.photosLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Archive
          </Link>
          <div className="flex items-center gap-2 text-[#c9a84c] text-sm font-medium mb-2 uppercase tracking-widest">
            <Newspaper className="w-4 h-4" />
            {newsletter.semester ?? "Newsletter"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{newsletter.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
            {newsletter.sentAt && (
              <div className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
                Sent {formatDate(newsletter.sentAt)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#c9a84c]" />
              Published {formatDate(newsletter.createdAt)}
            </div>
            {newsletter.sentCount > 0 && (
              <span className="text-gray-400">
                {newsletter.sentCount.toLocaleString()} recipients
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {hasSections ? (
          <Card className="shadow-sm">
            <CardContent className="pt-8 pb-8 space-y-10">
              <NewsletterSection
                title="Chapter Updates"
                content={newsletter.chapterUpdates}
              />
              <NewsletterSection
                title="Brother Achievements"
                content={newsletter.brotherAchievements}
              />
              <NewsletterSection
                title="Alumni Spotlights"
                content={newsletter.alumniSpotlights}
              />
              <NewsletterSection
                title="Upcoming Events"
                content={newsletter.upcomingEvents}
              />
              <NewsletterSection
                title="Photos &amp; Links"
                content={newsletter.photosLinks}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-500">No content available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                This newsletter has no sections to display.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
