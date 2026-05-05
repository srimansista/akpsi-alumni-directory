export const dynamic = "force-dynamic";

import Link from "next/link";
import { Newspaper, CalendarDays, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NewsletterItem = {
  id: string;
  title: string;
  semester: string | null;
  sentAt: Date | null;
  createdAt: Date;
  chapterUpdates: string | null;
};

async function getNewsletters() {
  try {
    return await prisma.newsletter.findMany({
      where: { isDraft: false },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [] as NewsletterItem[];
  }
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NewsletterPage() {
  const newsletters = await getNewsletters();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-[#c9a84c] text-sm font-medium mb-3 uppercase tracking-widest">
            <Newspaper className="w-4 h-4" />
            AKPsi Omega Theta
          </div>
          <h1 className="text-4xl font-bold mb-3">Newsletter Archive</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Stay up to date with chapter news, brother achievements, alumni spotlights,
            and upcoming events.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {newsletters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No newsletters yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back soon for chapter updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsletters.map((newsletter: NewsletterItem) => (
              <Link key={newsletter.id} href={`/newsletter/${newsletter.id}`} className="group">
                <Card className="h-full shadow-sm hover:shadow-md transition-shadow border hover:border-[#c9a84c]/40 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider mb-1">
                      <Newspaper className="w-3.5 h-3.5" />
                      {newsletter.semester ?? "Newsletter"}
                    </div>
                    <CardTitle className="text-[#1e3a5f] text-lg group-hover:underline leading-snug">
                      {newsletter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {newsletter.sentAt && (
                        <div className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Sent {formatDate(newsletter.sentAt)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(newsletter.createdAt)}
                      </div>
                    </div>
                    {newsletter.chapterUpdates && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {newsletter.chapterUpdates}
                      </p>
                    )}
                    <p className="text-[#1e3a5f] text-sm font-medium group-hover:underline">
                      Read newsletter →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
