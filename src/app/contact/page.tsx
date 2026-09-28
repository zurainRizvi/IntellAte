import type { Metadata } from "next";
import Link from "next/link";
import { getContactSettings, getNavigation, getProfile } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Contact · IntellAte" };

export default function ContactPage() {
  const profile = getProfile();
  const contact = getContactSettings();

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="contact-page">
        <p className="eyebrow">Contact</p>
        <h1 className="closing-title">Talk with IntellAte</h1>
        <p className="closing-copy">
          Questions about pricing, single vs multi-event packages, or a custom brief? Request a design and we will follow
          up — or reach us directly once channels are published.
        </p>
        <div className="hero-actions">
          <Link href="/order" className="btn btn-primary">
            Request This Design
          </Link>
          <Link href="/custom" className="btn btn-ghost">
            Start a custom brief
          </Link>
        </div>
        {contact.email || contact.whatsapp ? (
          <div className="hero-actions" style={{ marginTop: "1.5rem" }}>
            {contact.whatsapp ? (
              <a className="btn btn-ghost" href={`https://wa.me/${contact.whatsapp}`}>
                WhatsApp
              </a>
            ) : null}
            {contact.email ? (
              <a
                className="btn btn-ghost"
                href={`mailto:${contact.email}?subject=${encodeURIComponent("IntellAte invitation enquiry")}`}
              >
                Email {contact.email}
              </a>
            ) : null}
          </div>
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
      <SiteFooter profile={profile} />
    </>
  );
}
