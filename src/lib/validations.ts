import { z } from "zod";

export const alumniSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gradYear: z.preprocess(v => v === "" || v === undefined ? null : v, z.coerce.number().int().min(1900).max(2100).nullable()).optional(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedInUrl: z.string().url("Invalid URL").refine(value => /^https:\/\/(www\.)?linkedin\.com\//i.test(value), "Use a https://linkedin.com profile URL").optional().nullable().or(z.literal("")),
  company: z.string().max(100).optional().nullable(),
  pastCompanies: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
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
  gradYear: z.preprocess(v => v === "" || v === undefined ? null : v, z.coerce.number().int().min(1900).max(2100).nullable()).optional(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  linkedInUrl: z.string().url("Invalid LinkedIn URL").refine(value => /^https:\/\/(www\.)?linkedin\.com\//i.test(value), "Use a https://linkedin.com profile URL").optional().nullable().or(z.literal("")),
  company: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  willingToMentor: z.boolean().default(false),
  willingToSpeak: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export type AlumniInput = z.infer<typeof alumniSchema>;
export type AlumniUpdateInput = z.infer<typeof alumniUpdateSchema>;
