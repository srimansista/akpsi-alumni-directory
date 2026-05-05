import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  Tag,
  ArrowLeft,
  MessageCircle,
  Mic,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getAlumnus(id: string) {
  try {
    return await prisma.alumni.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#1e3a5f]" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm text-gray-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

const NA = <span className="text-gray-400 italic">Not provided</span>;

function val(v: string | null | undefined) {
  return v && v.trim() ? v.trim() : null;
}

export default async function AlumniProfilePage({ params }: Props) {
  const alumnus = await getAlumnus(params.id);

  if (!alumnus) {
    notFound();
  }

  const name = val(alumnus.name) ?? "Unknown";
  const email = val(alumnus.email);
  const linkedIn = val(alumnus.linkedInUrl);
  const company = val(alumnus.company);
  const role = val(alumnus.role);
  const major = val(alumnus.major);
  const location = val(alumnus.location);
  const industry = val(alumnus.industry);
  const notes = val(alumnus.notes);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="bg-[#1e3a5f] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{name}</h1>
              {alumnus.gradYear && (
                <p className="text-[#c9a84c] font-medium mt-1">
                  Class of {alumnus.gradYear}
                </p>
              )}
              {(company || role) && (
                <p className="text-gray-300 mt-1 text-sm">
                  {[role, company].filter(Boolean).join(" at ")}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {alumnus.willingToMentor && (
                <Badge className="bg-green-500/20 text-green-300 border-green-400/40 text-xs">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Open to Mentor
                </Badge>
              )}
              {alumnus.willingToSpeak && (
                <Badge className="bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/40 text-xs">
                  <Mic className="w-3 h-3 mr-1" />
                  Open to Speak
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 divide-y divide-gray-100">
              <DetailRow
                icon={Mail}
                label="Email"
                value={
                  email ? (
                    <a
                      href={`mailto:${email}`}
                      className="text-[#1e3a5f] hover:text-[#c9a84c] underline transition-colors"
                    >
                      {email}
                    </a>
                  ) : (
                    NA
                  )
                }
              />
              {linkedIn && (
                <div className="pt-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#0077b5] hover:bg-[#005582] text-white"
                  >
                    <a
                      href={linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View LinkedIn Profile
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Professional</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <DetailRow
                icon={Building2}
                label="Company"
                value={company ?? NA}
              />
              <DetailRow
                icon={Briefcase}
                label="Role"
                value={role ?? NA}
              />
              <DetailRow
                icon={Tag}
                label="Industry"
                value={industry ?? NA}
              />
            </CardContent>
          </Card>

          {/* Academic card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Academic</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <DetailRow
                icon={GraduationCap}
                label="Graduation Year"
                value={alumnus.gradYear ? String(alumnus.gradYear) : NA}
              />
              <DetailRow
                icon={GraduationCap}
                label="Major"
                value={major ?? NA}
              />
            </CardContent>
          </Card>

          {/* Location card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <DetailRow
                icon={MapPin}
                label="Location"
                value={location ?? NA}
              />
            </CardContent>
          </Card>
        </div>

        {/* Mentorship card */}
        {(alumnus.willingToMentor || alumnus.willingToSpeak || notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Willing to Mentor:</span>
                  {alumnus.willingToMentor ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">No</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Willing to Speak:</span>
                  {alumnus.willingToSpeak ? (
                    <Badge className="bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/40">Yes</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">No</Badge>
                  )}
                </div>
              </div>
              {notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back button */}
        <div className="pt-2">
          <Button
            asChild
            variant="outline"
            className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
          >
            <Link href="/directory">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
