import { Resend } from "resend";
import type { AlumniUpdateSubmission } from "@prisma/client";
import { z } from "zod";

export async function sendSubmissionNotification(submission: AlumniUpdateSubmission) {
  const to = z.string().email().parse(process.env.SUBMISSION_APPROVAL_EMAIL);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !process.env.AUTH_URL) {
    throw new Error("Submission email requires RESEND_API_KEY, EMAIL_FROM, and AUTH_URL");
  }
  const reviewUrl = new URL("/admin?tab=submissions", process.env.AUTH_URL);
  const fields = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Graduation year", submission.gradYear],
    ["Company", submission.company],
    ["Role", submission.role],
    ["Major", submission.major],
    ["Location", submission.location],
    ["Industry", submission.industry],
    ["LinkedIn", submission.linkedInUrl],
    ["Willing to mentor", submission.willingToMentor ? "Yes" : "No"],
    ["Willing to speak", submission.willingToSpeak ? "Yes" : "No"],
    ["Notes", submission.notes],
  ];
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: "Alumni update awaiting approval",
    text: [
      "A new alumni update is pending approval. Nothing has been published yet.",
      `Submission: ${submission.id}`,
      ...fields.map(([label, value]) => `${label}: ${value ?? "Not provided"}`),
      "",
      `Review and approve or reject: ${reviewUrl.toString()}`,
      "Sign in with your admin account and open Submissions to review this update.",
    ].join("\n"),
  }, { idempotencyKey: `submission-${submission.id}` });
  if (error) throw new Error(`Submission notification failed: ${error.name}`);
}
