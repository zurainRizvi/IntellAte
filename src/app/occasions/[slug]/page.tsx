import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNavigation, getOccasion, getProfile, getVisibleDesigns } from "@/content";
import { DesignCard } from "@/components/design-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  return { title: occasion ? `${occasion.title} · IntellAte` : "Occasion · IntellAte" };
}

export default async function OccasionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const occasion = getOccasion(slug);
  if (!occasion) notFound();
  const profile = getProfile();
  const designs = getVisibleDesigns({ occasion: occasion.slug });

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} />
      <main id="main" className="content-page">
        <p className="eyebrow">Occasion</p>
        <h1 className="closing-title">{occasion.title}</h1>
        <p className="closing-copy">{occasion.summary}</p>
        {designs.length > 0 ? (
          <div className="design-grid">
            {designs.map((design, index) => (
              <DesignCard key={design.slug} design={design} index={index} />
            ))}
          </div>
        ) : (
          <div className="content-block">
            <p className="closing-copy">
              No catalogue designs for this occasion yet — that is exactly what custom is for.
            </p>
            <Link href={`/custom?occasion=${occasion.slug}`} className="btn btn-primary">
              Create yours
            </Link>
          </div>
        )}
        <p style={{ marginTop: "2rem" }}>
          <Link href="/custom" className="text-link">
            Or start a fully custom brief →
          </Link>
        </p>
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
