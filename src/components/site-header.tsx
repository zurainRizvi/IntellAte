import Link from "next/link";
import type { NavItem, Profile } from "@/content/schema";

export function SiteHeader({ profile, navigation }: { profile: Profile; navigation: NavItem[] }) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={`${profile.brand}, ${profile.displayName} — home`}>
        <span className="wordmark-brand">{profile.brand}</span>
        <span className="wordmark-name">{profile.displayName}</span>
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
      <Link href="/contact" className="btn btn-primary header-cta">
        Discuss your project
      </Link>
    </header>
  );
}
