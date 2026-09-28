# IntellAte

Local **digital invitations MVP**: a futuristic galaxy shell, invitation catalogue
(single- and multi-event), occasions, custom brief, order-request flow, rules-based
AI Concierge, and a live anonymized flagship preview — **Aurora Safar**.

Brand: **IntellAte** · tagline **IA: Automate the Intellect** · promise
**Don't find the perfect invitation. Create yours.**

Stack: Next.js 16 (App Router, Turbopack) · React 19 · strict TypeScript · Tailwind CSS 4 ·
Three.js / React Three Fiber · GSAP ScrollTrigger · Zod · Framer Motion (flagship demo only).
Versions are pinned in `package-lock.json`.

## Run locally

```bash
npm install
npm run dev           # http://localhost:4317
```

Production-style review (drafts visible):

```bash
npm run preview       # builds with SHOW_DRAFT_CONTENT=true and serves on http://localhost:4318
```

Optional contact overrides: `CONTACT_EMAIL`, `CONTACT_WHATSAPP` (digits only, country code included).

## Checks

```bash
npm run lint
npm run typecheck
npm run build
node scripts/lab/checks.mjs            # fallback + branding behaviour against :4317 (BASE_URL to override)
node scripts/lab/perf.mjs              # lab performance profile against :4318
```

The lab scripts drive the locally installed Google Chrome through Playwright (`channel: "chrome"`).

## Review switches

| Query | Effect |
| --- | --- |
| `?motion=reduce` | Reduced-motion static layout |
| `?webgl=off` / `?scene=static` | Static poster fallback |
| `?camera=arrival\|match\|hero\|face` | Hold a camera pose for reference comparisons |
| `?quality=high\|medium\|low` | Force a particle tier |

## Layout

- `src/app` — marketing routes, order Server Action, root layout, global styles
- `src/components/galaxy` — particle generator, shaders, scene factory, smoke branch, R3F canvas
- `src/components/journey-timeline.tsx` — home ScrollTrigger timeline
- `src/demos/aurora-safar` — anonymized multi-event live preview (fictional couple)
- `src/content` — typed occasions, designs, profile, contact with server-side draft filtering
- `scripts/lab/` — capture, compare, check and perf tools
- `reference-videos/` — local reference footage only (gitignored, never committed)

## Flagship privacy

The live preview is adapted from a private wedding invitation prototype. Public demo names are
**Ayaan & Zara**, host **Mrs. Imran Malik**, design **Aurora Safar**. Personal phone numbers are
never shipped in the demo.

Commerce language: **Request This Design** / **Order Now — Pay After Confirmation** (not COD).

There is no intro video on the public marketing site. Visitors land on the live galaxy; the
flagship invitation itself is the product demo.
