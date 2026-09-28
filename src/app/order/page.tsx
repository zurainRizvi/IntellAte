import type { Metadata } from "next";
import { getNavigation, getOccasions, getProfile, getVisibleDesigns } from "@/content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { OrderForm } from "./order-form";

export const metadata: Metadata = { title: "Request a design · IntellAte" };

type SearchParams = Promise<{ design?: string }>;

export default async function OrderPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = getProfile();
  const params = await searchParams;
  const designs = getVisibleDesigns();
  const occasions = getOccasions();
  const selected = params.design && designs.some((d) => d.slug === params.design) ? params.design : designs[0]?.slug;

  return (
    <>
      <SiteHeader profile={profile} navigation={getNavigation()} ctaHref="/custom" ctaLabel="Create your own" />
      <main id="main" className="content-page">
        <p className="eyebrow">Order flow</p>
        <h1 className="closing-title">Request This Design</h1>
        <p className="closing-copy">
          Personalize the essentials below. You will receive a confirmation, then our team contacts you through WhatsApp
          or email to refine the invitation — pay after confirmation.
        </p>
        <OrderForm designs={designs} occasions={occasions} defaultDesignSlug={selected} source="design" />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
