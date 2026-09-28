import { z } from "zod";

export const publicationStatus = z.enum(["draft", "approved", "published"]);
export type PublicationStatus = z.infer<typeof publicationStatus>;

/** Every factual record carries its provenance so unverified claims never ship silently. */
export const recordMeta = z.object({
  status: publicationStatus,
  evidenceRef: z.string().min(1),
  lastVerified: z.iso.date().nullable(),
  displayPermission: z.enum(["pending", "granted", "denied"]),
});

export const profileSchema = z.object({
  meta: recordMeta,
  brand: z.string().min(1),
  /** Short company tagline shown under the wordmark and as the hero eyebrow. */
  tagline: z.string().min(1),
  headline: z.string().min(1),
  supporting: z.string().min(1),
});
export type Profile = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  meta: recordMeta,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  roles: z.array(z.string().min(1)).min(1),
  /** Shown instead of a link until the case-study page exists. */
  pendingNote: z.string().min(1),
});
export type Project = z.infer<typeof projectSchema>;

export const contactSettingsSchema = z.object({
  meta: recordMeta,
  email: z.email().nullable(),
  pendingMessage: z.string().min(1),
});
export type ContactSettings = z.infer<typeof contactSettingsSchema>;

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().regex(/^(\/|#)/, "Internal links only"),
});
export type NavItem = z.infer<typeof navItemSchema>;
