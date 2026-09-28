import type { Profile } from "@/content/schema";

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="site-footer">
      <p>
        {profile.brand} · {profile.tagline}
      </p>
      <p>Invitations MVP — local review only.</p>
    </footer>
  );
}
