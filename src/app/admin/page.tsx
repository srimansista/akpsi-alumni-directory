export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { requireMember } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText } from "lucide-react";
import AdminAlumniTab from "./AdminAlumniTab";
import AdminMembersTab from "./AdminMembersTab";
import AdminSubmissionsTab from "./AdminSubmissionsTab";

async function getAdminStats() {
  try {
    const [totalAlumni, pendingSubmissions] =
      await Promise.all([
        prisma.alumni.count(),
        prisma.alumniUpdateSubmission.count({ where: { status: "PENDING" } }),
      ]);
    return { totalAlumni, pendingSubmissions };
  } catch {
    return { totalAlumni: 0, pendingSubmissions: 0 };
  }
}

export default async function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await requireMember();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();

  return (
    <div className="workspace-page admin-page">
      {/* Header */}
      <div className="admin-page-heading">
        <div className="admin-content py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Signed in as {session.user?.email}
          </p>
        </div>
      </div>

      <div className="admin-content py-8">
        <Tabs defaultValue={searchParams.tab === "submissions" ? "submissions" : searchParams.tab === "members" ? "members" : "overview"}>
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
            <TabsTrigger value="members">Member access</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "View Alumni Directory", href: "/directory" },
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

          <TabsContent value="members"><AdminMembersTab/></TabsContent>
          {/* ── Alumni ── */}
          <TabsContent value="alumni">
            <AdminAlumniTab />
          </TabsContent>

          {/* ── Submissions ── */}
          <TabsContent value="submissions">
            <AdminSubmissionsTab />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
