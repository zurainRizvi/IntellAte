import type { ContactSettings, NavItem, Profile, Project } from "./schema";

export const profile: Profile = {
  meta: {
    status: "draft",
    evidenceRef: "Master brief §1; display name and brand settled 2026-09-28. Headline wording not yet approved.",
    lastVerified: "2026-09-28",
    displayPermission: "pending",
  },
  brand: "IntellAte",
  displayName: "Syed Rizvi",
  location: "Lahore, Pakistan",
  headline: "Your challenge. The right people. A solution built around you.",
  supporting:
    "I combine software engineering, business analysis and quality assurance to turn complex needs into practical solutions—working personally or bringing together trusted specialists.",
};

export const projects: Project[] = [
  {
    meta: {
      status: "draft",
      evidenceRef: "Master brief §4. Personal roles and public description await Syed's confirmation.",
      lastVerified: null,
      displayPermission: "pending",
    },
    slug: "rehza",
    eyebrow: "Selected work",
    title: "Rehza",
    summary:
      "A homeowner platform that brings property management, construction visibility, documents and connected services into one place.",
    roles: ["Business analysis", "Partnerships", "Quality assurance"],
    pendingNote: "Full case study arrives in Phase 2.",
  },
];

export const contactSettings: ContactSettings = {
  meta: {
    status: "draft",
    evidenceRef: "No contact channel supplied yet (brief §8: never invent addresses).",
    lastVerified: null,
    displayPermission: "pending",
  },
  email: null,
  pendingMessage:
    "Direct contact details are being confirmed. Until they are published, this page is the single place they will appear.",
};

export const navigation: NavItem[] = [
  { label: "Journey", href: "#journey" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "/contact" },
];
