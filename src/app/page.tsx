import Link from "next/link";
import { getNavigation, getProfile, getVisibleDesigns } from "@/content";
import { DesignCard } from "@/components/design-card";
import { JourneyTimeline } from "@/components/journey-timeline";
import { BootAttributes, PauseMotionButton } from "@/components/motion-controls";
import { SceneMount } from "@/components/scene-mount";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const profile = getProfile();
  const featured = getVisibleDesigns({ featured: true });
  const flagship = featured.find((d) => d.flagship) ?? featured[0];

  return (
    <>
      <BootAttributes />
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main">
        <section id="journey" className="stage" aria-labelledby="hero-title">
          <div className="stage-view">
            <div className="stage-backdrop" aria-hidden="true">
              <SceneMount />
            </div>

            <div className="hero" data-hero>
              <p className="hero-brand">{profile.brand}</p>
              <p className="hero-tagline">{profile.tagline}</p>
              <h1 id="hero-title" className="hero-title">
                {profile.headline}
              </h1>
              <p className="hero-support">{profile.supporting}</p>
              <div className="hero-actions">
                <Link href="/invitations" className="btn btn-primary">
                  Choose a design
                </Link>
                <Link href="/custom" className="btn btn-ghost">
                  Create your own
                </Link>
              </div>
            </div>

            <p className="scroll-hint" data-scroll-hint aria-hidden="true">
              Scroll to orbit
            </p>

            <div className="stage-controls live-only">
              <PauseMotionButton className="text-control" />
            </div>

            {flagship && (
              <div className="card-slot">
                <article id="work" className="project-card" data-card tabIndex={-1} aria-labelledby="work-title">
                  <p className="draft-badge">Flagship</p>
                  <p className="eyebrow">01 / {flagship.eyebrow}</p>
                  <h2 id="work-title" className="card-title">
                    {flagship.title}
                  </h2>
                  <p className="card-summary">{flagship.summary}</p>
                  <ul className="card-roles" aria-label="Events">
                    {flagship.eventLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                  <div className="hero-actions" style={{ marginTop: "1.1rem" }}>
                    <Link href={`/invitations/${flagship.slug}/preview`} className="btn btn-primary">
                      Open live preview
                    </Link>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>

        <section className="content-section" aria-labelledby="featured-title">
          <p className="eyebrow">Featured invitations</p>
          <h2 id="featured-title" className="closing-title">
            Choose a design or create your own
          </h2>
          <p className="closing-copy">{profile.promise}</p>
          <div className="design-grid">
            {featured.map((design, index) => (
              <DesignCard key={design.slug} design={design} index={index} />
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: "2rem" }}>
            <Link href="/invitations" className="btn btn-ghost">
              Browse all invitations
            </Link>
            <Link href="/occasions" className="btn btn-ghost">
              Explore occasions
            </Link>
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <h2 id="closing-title" className="closing-title">
            {profile.promise}
          </h2>
          <p className="closing-copy">
            Template buyers get a quick path. People who want something nobody else has take the custom path —
            designers refine the concept with you after you request it.
          </p>
          <div className="hero-actions">
            <Link href="/custom" className="btn btn-primary">
              Start a custom design
            </Link>
            <Link href="/order" className="btn btn-ghost">
              Request a design
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter profile={profile} />
      <JourneyTimeline />
    </>
  );
}
