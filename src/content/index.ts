import { z } from "zod";
import { contactSettings, navigation, profile, projects } from "./data";
import {
  contactSettingsSchema,
  navItemSchema,
  profileSchema,
  projectSchema,
  type Project,
  type PublicationStatus,
} from "./schema";

const envSchema = z.object({
  SHOW_DRAFT_CONTENT: z.enum(["true", "false"]).optional(),
  CONTACT_EMAIL: z.email().optional(),
});

const env = envSchema.parse({
  SHOW_DRAFT_CONTENT: process.env.SHOW_DRAFT_CONTENT || undefined,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || undefined,
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

export function getVisibleProjects(): Project[] {
  return z
    .array(projectSchema)
    .parse(projects)
    .filter((p) => isVisible(p.meta.status));
}

export function getContactSettings() {
  const settings = contactSettingsSchema.parse(contactSettings);
  return env.CONTACT_EMAIL ? { ...settings, email: env.CONTACT_EMAIL } : settings;
}
