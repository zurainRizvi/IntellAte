import type { Metadata } from "next";
import Link from "next/link";
import { getNavigation, getProfile, getVisibleDesigns } from "@/content";
import { DesignCard } from "@/components/design-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Invitations · IntellAte" };

type SearchParams = Promise<{ kind?: string }>;

export default async function InvitationsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = getProfile();
  const params = await searchParams;
  const kind = params.kind === "single" || params.kind === "multi" ? params.kind : undefined;
  const designs = getVisibleDesigns(kind ? { kind } : undefined);

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="content-page">
        <p className="eyebrow">Invitations</p>
        <h1 className="closing-title">Catalogue</h1>
        <p className="closing-copy">
          Single-event cards focus on one celebration. Multi-event cards carry a complete journey — like Mehndi,
          Baraat, and Waleema in one experience.
        </p>
        <div className="filter-row" role="group" aria-label="Filter by package">
          <Link href="/invitations" className={`filter-chip${!kind ? " is-active" : ""}`}>
            All
          </Link>
          <Link href="/invitations?kind=single" className={`filter-chip${kind === "single" ? " is-active" : ""}`}>
            Single-event
          </Link>
          <Link href="/invitations?kind=multi" className={`filter-chip${kind === "multi" ? " is-active" : ""}`}>
            Multi-event
          </Link>
        </div>
        <div className="design-grid">
          {designs.map((design, index) => (
            <DesignCard key={design.slug} design={design} index={index} />
          ))}
        </div>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
