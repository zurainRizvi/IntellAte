import type { Metadata } from "next";
import { getNavigation, getOccasions, getProfile, getVisibleDesigns } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OrderForm } from "@/app/order/order-form";

export const metadata: Metadata = { title: "Custom design · IntellAte" };

type SearchParams = Promise<{ occasion?: string }>;

export default async function CustomPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = getProfile();
  const params = await searchParams;
  const occasions = getOccasions();
  const designs = getVisibleDesigns();
  const defaultOccasion = occasions.some((o) => o.slug === params.occasion) ? params.occasion : "something-else";

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} ctaHref="/order" ctaLabel="Request a catalogue design" />
      <main id="main" className="content-page">
        <p className="eyebrow">Custom design</p>
        <h1 className="closing-title">Create yours</h1>
        <p className="closing-copy">
          Explain the idea, choose occasion and events, share style and colours. Upload references later over WhatsApp if
          you have them — designers refine the concept with you after this brief lands.
        </p>
        <OrderForm
          designs={designs}
          occasions={occasions}
          defaultOccasion={defaultOccasion}
          source="custom"
        />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
