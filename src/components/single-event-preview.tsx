'use client';

import dynamic from "next/dynamic";
import Link from "next/link";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@/demos/single-events/single-event.css";
import { getSingleEventTheme } from "@/demos/single-events/themes";
import type { SingleEventId } from "@/demos/single-events/types";

const SingleEventInvitation = dynamic(() => import("@/demos/single-events/SingleEventInvitation"), {
  ssr: false,
  loading: () => (
    <div className="sei-preview-loading" role="status">
      Loading invitation…
    </div>
  ),
});

export function SingleEventPreview({
  slug,
  embed = false,
}: {
  slug: SingleEventId;
  embed?: boolean;
}) {
  const theme = getSingleEventTheme(slug);
  if (!theme) return null;

  return (
    <div className={`sei-demo${embed ? " is-embed" : ""}`}>
      {!embed && (
        <div className="sei-preview-chrome">
          <Link href={`/invitations/${slug}`} className="sei-preview-back">
            ← Back to design
          </Link>
          <p className="sei-preview-note">Preview mode · fictional demo</p>
          <Link href={`/order?design=${slug}`} className="sei-preview-cta">
            Request This Design
          </Link>
        </div>
      )}
      <SingleEventInvitation theme={theme} />
    </div>
  );
}
