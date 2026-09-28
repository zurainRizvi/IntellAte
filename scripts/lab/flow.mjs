#!/usr/bin/env node
/**
 * Records intro → galaxy → orbit → card reveal and saves stage screenshots.
 *   node scripts/lab/flow.mjs <outDir>
 * Writes <outDir>/<layout>-flow.webm plus <layout>-NN-<stage>.png, and fallback-state screenshots.
 */
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4317";
const outDir = process.argv[2] || ".lab/flow";
mkdirSync(outDir, { recursive: true });

const layouts = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

const scrollJourney = (page, p) =>
  page.evaluate((p) => {
    const el = document.querySelector("#journey");
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top + (el.offsetHeight - innerHeight) * p);
  }, p);

async function glide(page, from, to, ms) {
  const steps = Math.round(ms / 33);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    await scrollJourney(page, from + (to - from) * (t * t * (3 - 2 * t)));
    await page.waitForTimeout(33);
  }
}

for (const [name, opts] of Object.entries(layouts)) {
  const videoDir = `${outDir}/.video-${name}`;
  const context = await browser.newContext({ ...opts, recordVideo: { dir: videoDir, size: opts.viewport } });
  const page = await context.newPage();
  const shot = (n, stage) => page.screenshot({ path: `${outDir}/${name}-${n}-${stage}.png` });

  await page.goto(base + "/?intro=play");
  await page.waitForFunction(() => document.querySelector("video")?.currentTime > 1.2, null, { timeout: 10000 });
  await shot("01", "intro-playing");
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await shot("02", "galaxy-handoff");
  await page.waitForTimeout(2600);
  await shot("03", "hero");
  await glide(page, 0, 0.3, 2500);
  await page.waitForTimeout(900);
  await shot("04", "orbit");
  await glide(page, 0.3, 0.62, 2500);
  await page.waitForTimeout(900);
  await shot("05", "face");
  await glide(page, 0.62, 0.95, 2800);
  await page.waitForTimeout(1500);
  await shot("06", "branch-and-card");

  await context.close();
  const [file] = readdirSync(videoDir);
  renameSync(`${videoDir}/${file}`, `${outDir}/${name}-flow.webm`);
  rmSync(videoDir, { recursive: true });
  console.log("recorded", name);
}

const states = [
  { name: "desktop-reduced-motion", path: "/", layout: "desktop", reducedMotion: "reduce" },
  { name: "desktop-no-webgl", path: "/?webgl=off&intro=skip", layout: "desktop" },
  { name: "desktop-no-js", path: "/", layout: "desktop", javaScriptEnabled: false, fullPage: true },
  { name: "mobile-no-js", path: "/", layout: "mobile", javaScriptEnabled: false, fullPage: true },
  { name: "mobile-reduced-motion", path: "/", layout: "mobile", reducedMotion: "reduce" },
  { name: "desktop-contact-no-js", path: "/contact", layout: "desktop", javaScriptEnabled: false },
];
for (const s of states) {
  const { layout, name, path, fullPage, ...ctx } = s;
  const context = await browser.newContext({ ...layouts[layout], ...ctx });
  const page = await context.newPage();
  await page.goto(base + path);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: !!fullPage });
  await context.close();
  console.log("wrote", name);
}

await browser.close();
