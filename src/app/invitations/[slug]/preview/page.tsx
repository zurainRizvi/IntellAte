import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDesign } from "@/content";
import { AuroraSafarPreview } from "@/components/aurora-safar-preview";
import { SingleEventPreview } from "@/components/single-event-preview";
import { singleEventIds } from "@/demos/single-events/themes";
import type { SingleEventId } from "@/demos/single-events/types";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ embed?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const design = getDesign(slug);
  return {
    title: design ? `Live preview · ${design.title}` : "Live preview",
    robots: { index: false, follow: false },
  };
}

export default async function LivePreviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const embed = query.embed === "1";
  const design = getDesign(slug);
  if (!design?.hasLivePreview) notFound();

  if (slug === "aurora-safar") {
    return <AuroraSafarPreview embed={embed} />;
  }

  if ((singleEventIds as string[]).includes(slug)) {
    return <SingleEventPreview slug={slug as SingleEventId} embed={embed} />;
  }

  notFound();
}
