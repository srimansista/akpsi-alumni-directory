export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, CalendarDays, Newspaper } from "lucide-react";
import AdminAlumniTab from "./AdminAlumniTab";
import AdminEventsTab from "./AdminEventsTab";
import AdminNewsletterTab from "./AdminNewsletterTab";
import AdminSubmissionsTab from "./AdminSubmissionsTab";

async function getAdminStats() {
  try {
    const now = new Date();
    const [totalAlumni, pendingSubmissions, upcomingEvents, newslettersSent] =
      await Promise.all([
        prisma.alumni.count(),
        prisma.alumniUpdateSubmission.count({ where: { status: "PENDING" } }),
        prisma.event.count({
          where: { isPublished: true, date: { gte: now } },
        }),
        prisma.newsletter.count({ where: { isDraft: false } }),
      ]);
    return { totalAlumni, pendingSubmissions, upcomingEvents, newslettersSent };
  } catch {
    return { totalAlumni: 0, pendingSubmissions: 0, upcomingEvents: 0, newslettersSent: 0 };
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-300 mt-1 text-sm">
            Signed in as {session.user?.email}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8 bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="alumni" className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Alumni
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Submissions
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" /> Newsletter
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  icon: Users,
                  label: "Total Alumni",
                  value: stats.totalAlumni.toLocaleString(),
                  color: "text-[#1e3a5f]",
                  bg: "bg-[#1e3a5f]/10",
                },
                {
                  icon: FileText,
                  label: "Pending Submissions",
                  value: stats.pendingSubmissions.toString(),
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  icon: CalendarDays,
                  label: "Upcoming Events",
                  value: stats.upcomingEvents.toString(),
                  color: "text-[#c9a84c]",
                  bg: "bg-[#c9a84c]/10",
                },
                {
                  icon: Newspaper,
                  label: "Newsletters Sent",
                  value: stats.newslettersSent.toString(),
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="pt-6 pb-5">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-gray-500 text-sm mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "View Alumni Directory", href: "/directory" },
                  { label: "View Events", href: "/events" },
                  { label: "View Newsletter Archive", href: "/newsletter" },
                  { label: "Submit Alumni Update", href: "/update" },
                ].map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="block p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-[#1e3a5f] font-medium hover:bg-[#1e3a5f] hover:text-white transition-colors text-center"
                  >
                    {label}
                  </a>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Alumni ── */}
          <TabsContent value="alumni">
            <AdminAlumniTab />
          </TabsContent>

          {/* ── Submissions ── */}
          <TabsContent value="submissions">
            <AdminSubmissionsTab />
          </TabsContent>

          {/* ── Events ── */}
          <TabsContent value="events">
            <AdminEventsTab />
          </TabsContent>

          {/* ── Newsletter ── */}
          <TabsContent value="newsletter">
            <AdminNewsletterTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
