import Link from "next/link";
import type { NavItem, Profile } from "@/content/schema";

export function SiteHeader({
  profile,
  navigation,
  ctaHref = "/custom",
  ctaLabel = "Create your own",
}: {
  profile: Profile;
  navigation: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={`${profile.brand} — home`}>
        <span className="wordmark-brand">{profile.brand}</span>
        <span className="wordmark-tagline">{profile.tagline}</span>
      </Link>
      <nav aria-label="Primary" className="site-nav">
        <ul>
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link href={ctaHref} className="btn btn-primary header-cta">
        {ctaLabel}
      </Link>
    </header>
  );
}
