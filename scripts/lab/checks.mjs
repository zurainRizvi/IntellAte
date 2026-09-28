#!/usr/bin/env node
/**
 * Behavioural checks for fallbacks against a running server.
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

await check("lands-on-live-galaxy", {}, async (page) => {
  await page.goto(base + "/");
  await page.waitForSelector("html[data-scene-ready]", { timeout: 20000 });
  const a = await html(page);
  const hasIntro = await page.locator(".intro-layer, [data-intro-skip], video.intro-video").count();
  const brand = await page.locator(".hero-brand").innerText();
  const tagline = await page.locator(".hero-tagline").innerText();
  const headline = await page.locator("#hero-title").innerText();
  return {
    pass:
      a.scene === "live" &&
      hasIntro === 0 &&
      brand.includes("IntellAte") &&
      tagline.includes("IA: Automate the Intellect") &&
      headline.includes("Digital invitations designed around your story"),
    attrs: a,
    hasIntro,
    brand,
    tagline,
    headline,
  };
});

await check("reduced-motion", { reducedMotion: "reduce" }, async (page) => {
  await page.goto(base + "/");
  await page.waitForTimeout(1200);
  const a = await html(page);
  const canvas = await page.locator("canvas").count();
  const card = await page.locator("[data-card]").isVisible();
  return { pass: a.scene === "static" && canvas === 0 && card, attrs: a, canvas, cardVisible: card };
});

await check("no-webgl", {}, async (page) => {
  await page.goto(base + "/?webgl=off");
  await page.waitForTimeout(1200);
  const a = await html(page);
  const canvas = await page.locator("canvas").count();
  return { pass: a.scene === "static" && canvas === 0, attrs: a, canvas };
});

await check("webgl-context-lost", {}, async (page) => {
  await page.goto(base + "/");
  await page.waitForSelector("html[data-scene-ready]", { timeout: 20000 });
  await page.evaluate(() =>
    document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
  );
  await page.waitForFunction(() => document.documentElement.dataset.scene === "static", null, { timeout: 4000 });
  return { attrs: await html(page) };
});

await check("no-js-home", { javaScriptEnabled: false }, async (page) => {
  await page.goto(base + "/");
  const text = await page.locator("main").innerText();
  const href = await page.locator('main a[href="/invitations"]').first().getAttribute("href");
  const cardVisible = await page.locator("[data-card]").isVisible();
  const hasIntro = await page.locator(".intro-layer, [data-intro-skip]").count();
  return {
    pass: cardVisible && !!href && hasIntro === 0 && /IntellAte/.test(await page.content()),
    invitationsHref: href,
    cardVisible,
    hasIntro,
    mainChars: text.length,
  };
});

await check("no-js-contact", { javaScriptEnabled: false }, async (page) => {
  const res = await page.goto(base + "/contact");
  const orderLink = await page.locator('a[href="/order"]').count();
  const pending = await page.locator(".contact-pending").count();
  const mailto = await page.locator('a[href^="mailto:"]').count();
  return {
    pass: res.status() === 200 && (orderLink > 0 || mailto + pending > 0),
    status: res.status(),
    orderLinks: orderLink,
    mailtoLinks: mailto,
    pendingNote: pending > 0,
  };
});

await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(JSON.stringify({ total: results.length, failed }));
process.exit(failed ? 1 : 0);
