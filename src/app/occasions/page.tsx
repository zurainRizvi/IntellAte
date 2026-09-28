import type { Metadata } from "next";
import Link from "next/link";
import { getNavigation, getOccasions, getProfile } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Occasions · IntellAte" };

export default function OccasionsPage() {
  const profile = getProfile();
  const occasions = getOccasions();

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="content-page">
        <p className="eyebrow">Occasions</p>
        <h1 className="closing-title">You name the occasion</h1>
        <p className="closing-copy">
          Wedding, birthday, newborn, graduation — or something else entirely. We design the invitation around your
          story.
        </p>
        <div className="design-grid">
          {occasions.map((occasion) => (
            <article key={occasion.slug} className="design-card">
              <p className="eyebrow">Occasion</p>
              <h2 className="card-title">{occasion.title}</h2>
              <p className="card-summary">{occasion.summary}</p>
              <div className="hero-actions" style={{ marginTop: "1.25rem" }}>
                <Link href={`/occasions/${occasion.slug}`} className="btn btn-primary">
                  View designs
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
