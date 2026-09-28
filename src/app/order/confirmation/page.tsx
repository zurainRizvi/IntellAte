import type { Metadata } from "next";
import Link from "next/link";
import { getContactSettings, getNavigation, getProfile } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Request received · IntellAte" };

type SearchParams = Promise<{ id?: string }>;

export default async function OrderConfirmationPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = getProfile();
  const contact = getContactSettings();
  const { id } = await searchParams;

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="content-page">
        <p className="eyebrow">Confirmation</p>
        <h1 className="closing-title">We received your request</h1>
        <p className="closing-copy">
          {id ? (
            <>
              Reference <span className="mono">{id}</span>.{" "}
            </>
          ) : null}
          Our designers will review the brief and contact you to confirm details, discuss revisions, and share the next
          steps. Payment happens after confirmation — not on this site.
        </p>
        {contact.email || contact.whatsapp ? (
          <div className="hero-actions">
            {contact.whatsapp ? (
              <a
                className="btn btn-primary"
                href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hi IntellAte — I just submitted request ${id ?? ""}.`)}`}
              >
                Message on WhatsApp
              </a>
            ) : null}
            {contact.email ? (
              <a className="btn btn-ghost" href={`mailto:${contact.email}?subject=${encodeURIComponent(`Order ${id ?? ""}`)}`}>
                Email {contact.email}
              </a>
            ) : null}
          </div>
        ) : (
          <p className="contact-pending" role="note">
            {contact.pendingMessage}
          </p>
        )}
        <p style={{ marginTop: "2rem" }}>
          <Link href="/invitations" className="text-link">
            ← Back to invitations
          </Link>
        </p>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
