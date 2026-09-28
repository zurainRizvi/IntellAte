import type { Metadata } from "next";
import Link from "next/link";
import { getContactSettings, getNavigation, getProfile } from "@/content";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Discuss your project · IntellAte" };

export default function ContactPage() {
  const profile = getProfile();
  const contact = getContactSettings();

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="contact-page">
        <p className="eyebrow">Contact</p>
        <h1 className="closing-title">Discuss your project</h1>
        <p className="closing-copy">
          Share the goal, how it works today and the main constraint. {profile.brand} will reply with how we would
          approach it — personally, with a team we assemble, or by introducing a specialist.
        </p>
        {contact.email ? (
          <p>
            <a className="btn btn-primary" href={`mailto:${contact.email}?subject=${encodeURIComponent("Project enquiry")}`}>
              Email {contact.email}
            </a>
          </p>
        ) : (
          <p className="contact-pending" role="note">
            {contact.pendingMessage}
          </p>
        )}
        <p>
          <Link href="/" className="text-link">
            ← Back to the galaxy
          </Link>
        </p>
      </main>
    </>
  );
}
