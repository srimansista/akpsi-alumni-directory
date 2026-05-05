export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarDays, MapPin, Users, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  endDate: Date | null;
  location: string | null;
  rsvpLink: string | null;
  audience: string[];
};

async function getEvents() {
  try {
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      prisma.event.findMany({
        where: { isPublished: true, date: { gte: now } },
        orderBy: { date: "asc" },
      }),
      prisma.event.findMany({
        where: { isPublished: true, date: { lt: now } },
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);
    return { upcoming, past };
  } catch {
    return { upcoming: [] as EventItem[], past: [] as EventItem[] };
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function EventCard({ event, isPast = false }: { event: EventItem; isPast?: boolean }) {
  const rsvpHref = event.rsvpLink ?? `/events/${event.id}`;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${isPast ? "opacity-75" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-[#1e3a5f] text-lg leading-tight">{event.title}</CardTitle>
          {!isPast && (
            <Badge className="bg-[#c9a84c]/20 text-[#8a6a1f] border-[#c9a84c]/40 shrink-0 text-xs">
              Upcoming
            </Badge>
          )}
        </div>
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 text-[#1e3a5f] shrink-0" />
            <span>
              {formatDate(event.date)} at {formatTime(event.date)}
              {event.endDate && ` – ${formatTime(event.endDate)}`}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-[#1e3a5f] shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {event.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {event.description}
          </p>
        )}
        {event.audience.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {event.audience.map((a: string) => (
              <Badge key={a} variant="outline" className="text-xs text-gray-600 border-gray-300">
                {a}
              </Badge>
            ))}
          </div>
        )}
        {!isPast && (
          <Button
            asChild
            size="sm"
            className="bg-[#1e3a5f] text-white hover:bg-[#162d4a] w-full sm:w-auto"
          >
            {event.rsvpLink ? (
              <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
                RSVP <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
              </a>
            ) : (
              <Link href={rsvpHref}>RSVP</Link>
            )}
          </Button>
        )}
        {isPast && (
          <Link href={`/events/${event.id}`} className="text-sm text-[#1e3a5f] hover:underline">
            View Details
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-[#c9a84c] text-sm font-medium mb-3 uppercase tracking-widest">
            <CalendarDays className="w-4 h-4" />
            AKPsi Omega Theta
          </div>
          <h1 className="text-4xl font-bold mb-3">Events</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Stay connected with upcoming chapter events, networking opportunities,
            and alumni gatherings.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#c9a84c] rounded-full inline-block" />
            Upcoming Events
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-sm">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No upcoming events</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for new events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event: EventItem) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full inline-block" />
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event: EventItem) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
