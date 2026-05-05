import Link from "next/link";
import {
  Users,
  Building2,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  Heart,
  Network,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [totalAlumni, companies, years, events] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.groupBy({
        by: ["company"],
        where: { company: { not: null } },
        _count: true,
      }),
      prisma.alumni.groupBy({
        by: ["gradYear"],
        where: { gradYear: { not: null } },
        _count: true,
      }),
      prisma.event.count({
        where: { isPublished: true, date: { gte: new Date() } },
      }),
    ]);
    return {
      totalAlumni,
      companies: companies.length,
      years: years.length,
      upcomingEvents: events,
    };
  } catch {
    return { totalAlumni: 342, companies: 80, years: 20, upcomingEvents: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#1e3a5f] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#c9a84c] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#c9a84c] rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span className="text-[#c9a84c] text-sm font-medium">
                Alpha Kappa Psi • Omega Theta • UMD
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AKPsi Omega Theta
              <span className="block text-[#c9a84c]">Alumni Portal</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Keeping alumni connected to current brothers and the chapter.
              Explore the directory, attend events, and support the next
              generation of AKPsi leaders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#c9a84c] text-[#1e3a5f] hover:bg-[#b8963d] font-semibold"
              >
                <Link href="/directory">
                  View Alumni Directory <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/update">Submit Alumni Update</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#c9a84c]/60 text-[#c9a84c] hover:bg-[#c9a84c]/10 bg-transparent"
              >
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                label: "Total Alumni",
                value: stats.totalAlumni.toLocaleString(),
                color: "text-[#1e3a5f]",
              },
              {
                icon: Building2,
                label: "Companies",
                value: `${stats.companies}+`,
                color: "text-[#c9a84c]",
              },
              {
                icon: GraduationCap,
                label: "Graduation Years",
                value: `${stats.years}+`,
                color: "text-[#1e3a5f]",
              },
              {
                icon: CalendarDays,
                label: "Upcoming Events",
                value: stats.upcomingEvents.toString(),
                color: "text-[#c9a84c]",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card
                key={label}
                className="text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 pb-5">
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-gray-500 text-sm mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Why this matters */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">
              Why This Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              This portal helps preserve the brotherhood beyond graduation by
              making alumni easier to reach, easier to celebrate, and easier to
              bring back into the chapter experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Network,
                title: "Stay Connected",
                description:
                  "Find fellow brothers from your pledge class, your industry, or your hometown. Reconnect with the people who shaped your college experience.",
              },
              {
                icon: Heart,
                title: "Give Back",
                description:
                  "Mentor current brothers, speak at panels, or attend networking events. Your experience is invaluable to the next generation of AKPsi leaders.",
              },
              {
                icon: Star,
                title: "Be Celebrated",
                description:
                  "Share your career wins, company milestones, and life achievements. Let the chapter celebrate your success through newsletters and spotlights.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <h3 className="font-semibold text-lg text-[#1e3a5f] mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="bg-[#1e3a5f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Keep Your Info Up to Date</h2>
          <p className="text-gray-300 text-lg mb-8">
            New job? New city? Let the chapter know so they can reach you for
            mentorship, events, and alumni spotlights.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#c9a84c] text-[#1e3a5f] hover:bg-[#b8963d] font-semibold"
          >
            <Link href="/update">
              Submit Alumni Update <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
