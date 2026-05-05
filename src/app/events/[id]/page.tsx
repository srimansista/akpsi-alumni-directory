export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventRsvpForm from "./RsvpForm";

async function getEvent(id: string) {
  try {
    return await prisma.event.findFirst({
      where: { id, isPublished: true },
      include: { _count: { select: { rsvps: true } } },
    });
  } catch {
    return null;
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

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#c9a84c]" />
              <span>
                {formatDate(event.date)} at {formatTime(event.date)}
                {event.endDate && ` – ${formatTime(event.endDate)}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c9a84c]" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.audience.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {event.audience.map((a: string) => (
                <Badge
                  key={a}
                  className="bg-white/10 text-white border-white/20 text-xs"
                >
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {event.description && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-base">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-[#1e3a5f] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date &amp; Time</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(event.date)} at {formatTime(event.date)}
                    {event.endDate && ` – ${formatTime(event.endDate)}`}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1e3a5f] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#1e3a5f] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">RSVPs</p>
                  <p className="text-sm text-gray-600">{event._count.rsvps} registered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RSVP */}
        <div className="lg:col-span-1">
          {isPast ? (
            <Card className="shadow-sm">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500 font-medium">This event has passed.</p>
                <p className="text-gray-400 text-sm mt-1">RSVPs are closed.</p>
              </CardContent>
            </Card>
          ) : event.rsvpLink ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-base">RSVP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  This event uses an external registration link.
                </p>
                <a
                  href={event.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-[#1e3a5f] text-white rounded-md py-2 text-sm font-medium hover:bg-[#162d4a] transition-colors"
                >
                  RSVP Now
                </a>
              </CardContent>
            </Card>
          ) : (
            <EventRsvpForm eventId={event.id} />
          )}
        </div>
      </div>
    </div>
  );
}
