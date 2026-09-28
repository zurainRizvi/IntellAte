import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesign, getNavigation, getProfile } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const design = getDesign(slug);
  return { title: design ? `${design.title} · IntellAte` : "Design · IntellAte" };
}

export default async function DesignPreviewPage({ params }: { params: Params }) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) notFound();
  const profile = getProfile();

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} ctaHref={`/order?design=${design.slug}`} ctaLabel="Request This Design" />
      <main id="main" className="content-page">
        <p className="eyebrow">{design.eyebrow}</p>
        <h1 className="closing-title">{design.title}</h1>
        <p className="closing-copy">{design.summary}</p>

        {design.hasLivePreview && (
          <p className="closing-copy" style={{ marginTop: "0.75rem" }}>
            Open the live preview to experience the full card — or use the phone thumbnail on the catalogue to
            preview and maximize in place.
          </p>
        )}

        <dl className="spec-list">
          <div>
            <dt>Package</dt>
            <dd>{design.kind === "multi" ? "Multi-event card" : "Single-event card"}</dd>
          </div>
          <div>
            <dt>Events</dt>
            <dd>
              {design.eventCount} — {design.eventLabels.join(", ")}
            </dd>
          </div>
          <div>
            <dt>Starting price</dt>
            <dd>{design.startingPrice}</dd>
          </div>
        </dl>

        <section className="content-block" aria-labelledby="features-title">
          <h2 id="features-title" className="section-heading">
            Animations & features
          </h2>
          <ul className="feature-list">
            {design.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="content-block" aria-labelledby="custom-title">
          <h2 id="custom-title" className="section-heading">
            Customization possibilities
          </h2>
          <p className="closing-copy">{design.customizationNotes}</p>
        </section>

        <div className="hero-actions">
          {design.hasLivePreview && (
            <Link href={`/invitations/${design.slug}/preview`} className="btn btn-primary">
              Open live preview
            </Link>
          )}
          <Link href={`/order?design=${design.slug}`} className="btn btn-primary">
            Request This Design
          </Link>
          <Link href="/custom" className="btn btn-ghost">
            Prefer fully custom?
          </Link>
        </div>
        <p className="fine-print">Order now — pay after confirmation. Our team contacts you by WhatsApp or email.</p>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
