# IntellAte — Phase 1 prototype

Local prototype of the IntellAte portfolio opening: intro film → live real-time galaxy → scroll-controlled
orbit → one smoke branch → one project card, with reduced-motion, no-WebGL and no-JavaScript fallbacks.

Stack: Next.js 16 (App Router, Turbopack) · React 19 · strict TypeScript · Tailwind CSS 4 · Three.js /
React Three Fiber · GSAP ScrollTrigger · Zod. Versions are pinned in `package-lock.json`.

> Intro footage source and public-use permission are unresolved. Local review only — do not publish.

## Run locally

```bash
npm install
npm run media:intro   # builds public/media/intro-{1080,720}.mp4 from reference-videos/ (needs ffmpeg)
npm run dev           # http://localhost:4317
```

`media:intro` uses `ffmpeg` on `PATH`, or the binary named by `FFMPEG_PATH`.
Without the derived videos the intro reports "missing" and the site opens directly on the galaxy.

Production-style review (drafts visible):

```bash
npm run preview       # builds with SHOW_DRAFT_CONTENT=true and serves on http://localhost:4318
```

A plain `npm run build && npm start` hides draft content, so the unverified Rehza card is absent there.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
node scripts/lab/checks.mjs            # intro + fallback behaviour against :4317 (BASE_URL to override)
node scripts/lab/perf.mjs              # lab performance profile against :4318
```

The lab scripts drive the locally installed Google Chrome through Playwright (`channel: "chrome"`).

## Review switches

| Query | Effect |
| --- | --- |
| `?intro=play` / `?intro=skip` | Force or skip the intro (it otherwise plays once per browser) |
| `?introsrc=missing` | Simulate a missing intro file |
| `?motion=reduce` | Reduced-motion static layout |
| `?webgl=off` / `?scene=static` | Static poster fallback |
| `?camera=arrival\|match\|hero\|face` | Hold a camera pose for reference comparisons |
| `?quality=high\|medium\|low` | Force a particle tier |

## Layout

- `src/app` — pages, root layout, global styles (static layout is the default; live mode is opt-in via `data-scene`)
- `src/components/galaxy` — particle generator, shaders, scene factory, smoke branch, R3F canvas
- `src/components/intro` — intro overlay (Skip / Replay / failure handling)
- `src/components/journey-timeline.tsx` — the single ScrollTrigger timeline
- `src/config/motion.ts` — camera poses and timeline spans
- `src/content` — typed, validated content with server-side draft filtering
- `scripts/` — intro derivative builder and lab capture/compare/check/perf tools
- `reference-videos/` — local source footage, never committed
