import Link from "next/link";
import { getNavigation, getProfile, getVisibleProjects } from "@/content";
import type { Project } from "@/content/schema";
import { IntroOverlay } from "@/components/intro/intro-overlay";
import { JourneyTimeline } from "@/components/journey-timeline";
import { BootAttributes, PauseMotionButton, ReplayIntroButton } from "@/components/motion-controls";
import { SceneMount } from "@/components/scene-mount";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const profile = getProfile();
  const [project] = getVisibleProjects();

  return (
    <>
      <IntroOverlay />
      <BootAttributes />
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main">
        <section id="journey" className="stage" aria-labelledby="hero-title">
          <div className="stage-view">
            <div className="stage-backdrop" aria-hidden="true">
              <SceneMount />
            </div>

            <div className="hero" data-hero>
              <p className="eyebrow">
                {profile.displayName} · {profile.location}
              </p>
              <h1 id="hero-title" className="hero-title">
                {profile.headline}
              </h1>
              <p className="hero-support">{profile.supporting}</p>
              <div className="hero-actions">
                <Link href="/contact" className="btn btn-primary">
                  Discuss your project
                </Link>
                <a href="#work" className="btn btn-ghost">
                  Explore my journey
                </a>
              </div>
            </div>

            <p className="scroll-hint" data-scroll-hint aria-hidden="true">
              Scroll to orbit
            </p>

            <div className="stage-controls live-only">
              <ReplayIntroButton className="text-control" />
              <PauseMotionButton className="text-control" />
            </div>

            {project && (
              <div className="card-slot">
                <ProjectCard project={project} />
              </div>
            )}
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <h2 id="closing-title" className="closing-title">
            What are you trying to solve?
          </h2>
          <p className="closing-copy">
            Tell me about the goal, the current process and what is in the way. I will reply with how I would approach
            it and who should do the work.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="btn btn-primary">
              Discuss your project
            </Link>
            <ReplayIntroButton className="btn btn-ghost js-only" />
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <p>
          {profile.brand} · {profile.displayName}
        </p>
        <p>Phase 1 prototype — local review only.</p>
      </footer>
      <JourneyTimeline />
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article id="work" className="project-card" data-card tabIndex={-1} aria-labelledby="work-title">
      {project.meta.status === "draft" && <p className="draft-badge">Draft · awaiting verification</p>}
      <p className="eyebrow">01 / {project.eyebrow}</p>
      <h2 id="work-title" className="card-title">
        {project.title}
      </h2>
      <p className="card-summary">{project.summary}</p>
      <ul className="card-roles" aria-label="My roles">
        {project.roles.map((role) => (
          <li key={role}>{role}</li>
        ))}
      </ul>
      <p className="card-pending">{project.pendingNote}</p>
    </article>
  );
}
