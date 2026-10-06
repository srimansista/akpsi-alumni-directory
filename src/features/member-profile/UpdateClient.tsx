"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alumniUpdateSchema } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Loader2 } from "lucide-react";

type AlumniUpdateFormValues = {
  name: string;
  gradYear?: number | null;
  email?: string | null;
  linkedInUrl?: string | null;
  company?: string | null;
  role?: string | null;
  major?: string | null;
  location?: string | null;
  industry?: string | null;
  willingToMentor: boolean;
  willingToSpeak: boolean;
  notes?: string | null;
};

export default function UpdateClient({ initialValues }: {initialValues: Partial<AlumniUpdateFormValues>}) {
  const [notificationSent, setNotificationSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AlumniUpdateFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(alumniUpdateSchema) as any,
    defaultValues: {
      willingToMentor: false,
      willingToSpeak: false,
      ...initialValues,
    },
  });

  const willingToMentor = watch("willingToMentor");
  const willingToSpeak = watch("willingToSpeak");

  const onSubmit = async (data: AlumniUpdateFormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Submission failed. Please try again.");
      }
      const result = await res.json();
      setNotificationSent(result.notificationSent === true);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-md">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
              Update Submitted!
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Thank you for keeping your info up to date. An admin will review
              your submission before any changes appear in the directory.
            </p>
            <p className="text-gray-500 text-sm mt-3" role="status">
              {notificationSent
                ? "The reviewer has been notified by email."
                : "Your update is saved in the approval queue, but the email notification could not be delivered. You do not need to submit it again."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="workspace-page update-page">
      <div className="page-kicker">THE COLLECTIVE / YOUR PROFILE</div>
      <header className="workspace-heading"><div><p className="edition-label">LET’S STAY IN TOUCH.</p><h1>My profile<span>.</span></h1><p>Your current information, ready to edit. Changes are reviewed by the chapter.</p></div></header>
      <div className="update-layout"><aside className="update-guide"><span className="edition-label">A QUICK PROFILE REFRESH</span><h2>Keep the door open.</h2><p>Your current details help brothers find you and the chapter stay connected.</p><ol><li><span>01</span> Your details</li><li><span>02</span> Career & education</li><li><span>03</span> Chapter involvement</li></ol><div className="review-note"><strong>What happens next?</strong><p>The chapter reviews your submission before publishing changes to the directory.</p></div></aside>
        <Card className="update-form-card">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">01 / Your details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grad Year */}
                <div className="space-y-1.5">
                  <Label htmlFor="gradYear">Graduation Year</Label>
                  <Input
                    id="gradYear"
                    type="number"
                    placeholder="2022"
                    {...register("gradYear")}
                  />
                  {errors.gradYear && (
                    <p className="text-xs text-red-500">{errors.gradYear.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/janesmith"
                  {...register("linkedInUrl")}
                />
                {errors.linkedInUrl && (
                  <p className="text-xs text-red-500">{errors.linkedInUrl.message}</p>
                )}
              </div>

              <h2 className="form-section-title">02 / Career & education</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company */}
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    {...register("company")}
                  />
                  {errors.company && (
                    <p className="text-xs text-red-500">{errors.company.message}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input
                    id="role"
                    placeholder="Software Engineer"
                    {...register("role")}
                  />
                  {errors.role && (
                    <p className="text-xs text-red-500">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Major */}
                <div className="space-y-1.5">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    placeholder="Finance"
                    {...register("major")}
                  />
                  {errors.major && (
                    <p className="text-xs text-red-500">{errors.major.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Washington, DC"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500">{errors.location.message}</p>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Technology, Finance, Consulting..."
                  {...register("industry")}
                />
                {errors.industry && (
                  <p className="text-xs text-red-500">{errors.industry.message}</p>
                )}
              </div>

              <h2 className="form-section-title">03 / Chapter involvement</h2>
              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes / Message</Label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Any updates, achievements, or things you'd like to share with the chapter..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-xs text-red-500">{errors.notes.message}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="willingToMentor"
                    checked={!!willingToMentor}
                    onCheckedChange={(checked) =>
                      setValue("willingToMentor", !!checked)
                    }
                  />
                  <Label htmlFor="willingToMentor" className="cursor-pointer leading-snug">
                    I am willing to mentor current AKPsi brothers
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="willingToSpeak"
                    checked={!!willingToSpeak}
                    onCheckedChange={(checked) =>
                      setValue("willingToSpeak", !!checked)
                    }
                  />
                  <Label htmlFor="willingToSpeak" className="cursor-pointer leading-snug">
                    I am willing to speak at chapter events or panels
                  </Label>
                </div>
              </div>

              {/* Error message */}
              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {submitError}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit profile changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
