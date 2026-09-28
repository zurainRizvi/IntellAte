import { z } from "zod";
import { contactSettings, designs, navigation, occasions, profile } from "./data";
import {
  contactSettingsSchema,
  designSchema,
  navItemSchema,
  occasionSchema,
  occasionSlug,
  profileSchema,
  type Design,
  type DesignKind,
  type Occasion,
  type OccasionSlug,
  type PublicationStatus,
} from "./schema";

const envSchema = z.object({
  SHOW_DRAFT_CONTENT: z.enum(["true", "false"]).optional(),
  CONTACT_EMAIL: z.email().optional(),
  CONTACT_WHATSAPP: z
    .string()
    .regex(/^[0-9]+$/)
    .optional(),
});

const env = envSchema.parse({
  SHOW_DRAFT_CONTENT: process.env.SHOW_DRAFT_CONTENT || undefined,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || undefined,
  CONTACT_WHATSAPP: process.env.CONTACT_WHATSAPP || undefined,
});

/**
 * Drafts are visible in development and in explicit review builds only.
 * Filtering happens on the server, so excluded records never reach the browser payload.
 */
export const showDrafts =
  env.SHOW_DRAFT_CONTENT === undefined
    ? process.env.NODE_ENV !== "production"
    : env.SHOW_DRAFT_CONTENT === "true";

const isVisible = (status: PublicationStatus) => status === "published" || showDrafts;

export function getProfile() {
  return profileSchema.parse(profile);
}

export function getNavigation() {
  return z.array(navItemSchema).parse(navigation);
}

export function getOccasions(): Occasion[] {
  return z
    .array(occasionSchema)
    .parse(occasions)
    .filter((o) => isVisible(o.meta.status));
}

export function getOccasion(slug: string): Occasion | undefined {
  const parsed = occasionSlug.safeParse(slug);
  if (!parsed.success) return undefined;
  return getOccasions().find((o) => o.slug === parsed.data);
}

export function getVisibleDesigns(filters?: {
  kind?: DesignKind;
  occasion?: OccasionSlug;
  featured?: boolean;
}): Design[] {
  return z
    .array(designSchema)
    .parse(designs)
    .filter((d) => isVisible(d.meta.status))
    .filter((d) => (filters?.kind ? d.kind === filters.kind : true))
    .filter((d) => (filters?.occasion ? d.occasions.includes(filters.occasion) : true))
    .filter((d) => (filters?.featured === undefined ? true : d.featured === filters.featured));
}

export function getDesign(slug: string): Design | undefined {
  return getVisibleDesigns().find((d) => d.slug === slug);
}

export function getContactSettings() {
  const settings = contactSettingsSchema.parse(contactSettings);
  return {
    ...settings,
    email: env.CONTACT_EMAIL ?? settings.email,
    whatsapp: env.CONTACT_WHATSAPP ?? settings.whatsapp,
  };
}
