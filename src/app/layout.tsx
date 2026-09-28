import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { getProfile } from "@/content";
import { bootScript } from "@/lib/boot-script";
import "./globals.css";

const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif-face", subsets: ["latin"], weight: "400" });

const profile = getProfile();

export const metadata: Metadata = {
  title: `${profile.displayName} · ${profile.brand}`,
  description: profile.supporting,
  // Local prototype: intro footage permission is unresolved, so nothing is indexable.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
