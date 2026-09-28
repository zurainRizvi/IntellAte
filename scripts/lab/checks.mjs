#!/usr/bin/env node
/**
 * Behavioural checks for the intro and fallbacks against a running server.
 *   node scripts/lab/checks.mjs [outDir]
 * Prints one JSON line per check and writes evidence screenshots to outDir.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4317";
const outDir = process.argv[2] || ".lab/checks";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
const results = [];

async function check(name, opts, fn) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let pass = false;
  let detail = {};
  try {
    detail = (await fn(page, context)) ?? {};
    pass = detail.pass !== false;
  } catch (e) {
    detail = { error: String(e.message || e).split("\n")[0] };
  }
  await page.screenshot({ path: `${outDir}/${name}.png` }).catch(() => {});
  if (errors.length) detail.pageErrors = errors;
  const r = { check: name, pass, ...detail };
  results.push(r);
  console.log(JSON.stringify(r));
  await context.close();
}

const html = (page) => page.evaluate(() => ({ ...document.documentElement.dataset }));
const introVisible = (page) =>
  page.evaluate(() => {
    const el = document.querySelector(".intro-layer");
    return !!el && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
  });

await check("skip-from-frame-0", {}, async (page) => {
  await page.goto(base + "/?intro=play", { waitUntil: "commit" });
  await page.locator("[data-intro-skip]").click({ timeout: 5000 });
  const t0 = Date.now();
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 3000 });
  return { skipToDoneMs: Date.now() - t0, attrs: await html(page) };
});

await check("escape-skips", {}, async (page) => {
  await page.goto(base + "/?intro=play");
  await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0.3, null, { timeout: 8000 });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 3000 });
  return { outcome: (await html(page)).introOutcome };
});

await check("plays-to-end-and-crossfades", {}, async (page) => {
  await page.goto(base + "/?intro=play");
  await page.waitForFunction(() => document.documentElement.dataset.introOutcome, null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 5000 });
  const a = await html(page);
  return { pass: a.introOutcome === "ended" && a.scene === "live", outcome: a.introOutcome, scene: a.scene };
});

await check("replay", {}, async (page) => {
  await page.goto(base + "/?intro=skip");
  await page.waitForSelector("html[data-scene-ready]", { timeout: 20000 });
  await page.getByRole("button", { name: "Replay intro" }).first().click();
  await page.waitForFunction(() => document.documentElement.dataset.intro === "play", null, { timeout: 3000 });
  await page.waitForFunction(() => document.querySelector("video")?.currentTime > 0.5, null, { timeout: 8000 });
  const visible = await introVisible(page);
  await page.locator("[data-intro-skip]").click();
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 3000 });
  return { pass: visible, overlayVisibleDuringReplay: visible };
});

await check("missing-video", {}, async (page) => {
  await page.goto(base + "/?intro=play&introsrc=missing");
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 6000 });
  const a = await html(page);
  return { pass: a.introOutcome === "missing", outcome: a.introOutcome, scene: a.scene };
});

await check("slow-video-times-out", {}, async (page) => {
  await page.route("**/media/intro-*.mp4", async (route) => {
    await new Promise((r) => setTimeout(r, 8000));
    await route.continue().catch(() => {});
  });
  await page.goto(base + "/?intro=play");
  const t0 = Date.now();
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 8000 });
  const a = await html(page);
  return { pass: a.introOutcome === "slow", outcome: a.introOutcome, afterMs: Date.now() - t0 };
});

await check("autoplay-rejected", {}, async (page) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("blocked", "NotAllowedError"));
  });
  await page.goto(base + "/?intro=play");
  await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 5000 });
  const a = await html(page);
  return { pass: a.introOutcome === "autoplay-blocked", outcome: a.introOutcome };
});

await check("reduced-motion", { reducedMotion: "reduce" }, async (page) => {
  await page.goto(base + "/");
  await page.waitForTimeout(1200);
  const a = await html(page);
  const canvas = await page.locator("canvas").count();
  const card = await page.locator("[data-card]").isVisible();
  return { pass: a.scene === "static" && a.intro === "done" && canvas === 0 && card, attrs: a, canvas, cardVisible: card };
});

await check("no-webgl", {}, async (page) => {
  await page.goto(base + "/?webgl=off&intro=skip");
  await page.waitForTimeout(1200);
  const a = await html(page);
  const canvas = await page.locator("canvas").count();
  return { pass: a.scene === "static" && canvas === 0, attrs: a, canvas };
});

await check("webgl-context-lost", {}, async (page) => {
  await page.goto(base + "/?intro=skip");
  await page.waitForSelector("html[data-scene-ready]", { timeout: 20000 });
  await page.evaluate(() => document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
  await page.waitForFunction(() => document.documentElement.dataset.scene === "static", null, { timeout: 4000 });
  return { attrs: await html(page) };
});

await check("no-js-home", { javaScriptEnabled: false }, async (page) => {
  await page.goto(base + "/");
  const text = await page.locator("main").innerText();
  const href = await page.locator('main a[href="/contact"]').first().getAttribute("href");
  const cardVisible = await page.locator("[data-card]").isVisible();
  const skipVisible = await page.locator("[data-intro-skip]").isVisible().catch(() => false);
  return {
    pass: cardVisible && !!href && !skipVisible && /Syed Rizvi/.test(await page.content()),
    contactHref: href,
    cardVisible,
    introShown: skipVisible,
    mainChars: text.length,
  };
});

await check("no-js-contact", { javaScriptEnabled: false }, async (page) => {
  const res = await page.goto(base + "/contact");
  const mailto = await page.locator('a[href^="mailto:"]').count();
  const pending = await page.locator(".contact-pending").count();
  return { pass: res.status() === 200 && mailto + pending > 0, status: res.status(), mailtoLinks: mailto, pendingNote: pending > 0 };
});

await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(JSON.stringify({ total: results.length, failed }));
process.exit(failed ? 1 : 0);
