import { z } from "zod";

export const alumniSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gradYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedInUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  company: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  willingToMentor: z.boolean().default(false),
  willingToSpeak: z.boolean().default(false),
  notes: z.string().max(2000).optional().nullable(),
  adminNotes: z.string().max(2000).optional().nullable(),
  unsubscribed: z.boolean().default(false),
});

export const alumniUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gradYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedInUrl: z.string().url("Invalid LinkedIn URL").optional().nullable().or(z.literal("")),
  company: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  willingToMentor: z.boolean().default(false),
  willingToSpeak: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  rsvpLink: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  audience: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

export const newsletterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  semester: z.string().max(50).optional().nullable(),
  chapterUpdates: z.string().max(10000).optional().nullable(),
  brotherAchievements: z.string().max(10000).optional().nullable(),
  alumniSpotlights: z.string().max(10000).optional().nullable(),
  upcomingEvents: z.string().max(10000).optional().nullable(),
  photosLinks: z.string().max(10000).optional().nullable(),
  isDraft: z.boolean().default(true),
});

export const eventRsvpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]).default("ATTENDING"),
});

export type AlumniInput = z.infer<typeof alumniSchema>;
export type AlumniUpdateInput = z.infer<typeof alumniUpdateSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type EventRsvpInput = z.infer<typeof eventRsvpSchema>;
