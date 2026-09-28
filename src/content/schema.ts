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
  promise: z.string().min(1),
});
export type Profile = z.infer<typeof profileSchema>;

export const occasionSlug = z.enum([
  "wedding",
  "birthday",
  "newborn",
  "graduation",
  "anniversary",
  "engagement",
  "corporate",
  "something-else",
]);
export type OccasionSlug = z.infer<typeof occasionSlug>;

export const occasionSchema = z.object({
  meta: recordMeta,
  slug: occasionSlug,
  title: z.string().min(1),
  summary: z.string().min(1),
});
export type Occasion = z.infer<typeof occasionSchema>;

export const designKind = z.enum(["single", "multi"]);
export type DesignKind = z.infer<typeof designKind>;

export const designSchema = z.object({
  meta: recordMeta,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  eyebrow: z.string().min(1),
  summary: z.string().min(1),
  occasions: z.array(occasionSlug).min(1),
  kind: designKind,
  eventCount: z.number().int().min(1),
  eventLabels: z.array(z.string().min(1)).min(1),
  features: z.array(z.string().min(1)).min(1),
  customizationNotes: z.string().min(1),
  startingPrice: z.string().min(1),
  featured: z.boolean(),
  flagship: z.boolean(),
  hasLivePreview: z.boolean(),
  /** Soft swatches used by catalogue phone thumbnails. */
  previewSwatch: z
    .object({
      bg: z.string().min(1),
      accent: z.string().min(1),
      ink: z.string().min(1),
      soft: z.string().min(1),
    })
    .optional(),
});
export type Design = z.infer<typeof designSchema>;

export const contactSettingsSchema = z.object({
  meta: recordMeta,
  email: z.email().nullable(),
  whatsapp: z
    .string()
    .regex(/^[0-9]+$/)
    .nullable(),
  pendingMessage: z.string().min(1),
});
export type ContactSettings = z.infer<typeof contactSettingsSchema>;

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().regex(/^(\/|#)/, "Internal links only"),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const orderRequestSchema = z.object({
  source: z.enum(["design", "custom"]),
  designSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  occasion: occasionSlug,
  eventCount: z.coerce.number().int().min(1).max(12),
  names: z.string().min(1).max(200),
  eventDate: z.string().min(1).max(80),
  style: z.string().min(1).max(200),
  colors: z.string().min(1).max(200),
  notes: z.string().max(4000).optional(),
  contactName: z.string().min(1).max(120),
  contactEmail: z.email(),
  contactPhone: z.string().min(5).max(40),
  preferredChannel: z.enum(["whatsapp", "email"]),
});
export type OrderRequest = z.infer<typeof orderRequestSchema>;
