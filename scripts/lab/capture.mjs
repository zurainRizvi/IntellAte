#!/usr/bin/env node
/**
 * Screenshot helper for visual review. Uses the locally installed Google Chrome.
 *   node scripts/lab/capture.mjs '<json job or array of jobs>'
 * Job: { path, width, height, out, scroll?: 0..1 of #journey, wait?: ms, hideUi?: bool, dpr?: number, headed?: bool }
 */
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4317";
const jobs = [JSON.parse(process.argv[2])].flat();
const headed = jobs.some((j) => j.headed);

const browser = await chromium.launch({
  channel: "chrome",
  headless: !headed,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

for (const job of jobs) {
  const context = await browser.newContext({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: job.dpr ?? 1,
    reducedMotion: job.reducedMotion ? "reduce" : "no-preference",
    javaScriptEnabled: job.javaScript !== false,
  });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && console.error("[console]", m.text()));
  await page.goto(base + job.path, { waitUntil: "load" });
  if (job.javaScript !== false && !job.noScene) {
    await page.waitForSelector("html[data-scene-ready]", { timeout: 20000 }).catch(() => console.warn("scene not ready"));
  }
  if (job.scroll !== undefined) {
    await page.evaluate((p) => {
      const el = document.querySelector("#journey");
      const top = el.getBoundingClientRect().top + scrollY;
      window.scrollTo(0, top + (el.offsetHeight - innerHeight) * p);
    }, job.scroll);
  }
  if (job.hideUi) {
    await page.addStyleTag({ content: ".site-header,.hero,.card-slot,.scroll-hint,.stage-controls{visibility:hidden!important}" });
  }
  await page.waitForTimeout(job.wait ?? 1500);
  if (job.info) {
    console.log(
      JSON.stringify(
        await page.evaluate(() => {
          const c = document.createElement("canvas").getContext("webgl2");
          const ext = c?.getExtension("WEBGL_debug_renderer_info");
          return {
            renderer: ext ? c.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "n/a",
            tier: document.querySelector("[data-tier]")?.getAttribute("data-tier"),
            scene: document.documentElement.dataset.scene,
          };
        }),
      ),
    );
  }
  await page.screenshot({ path: job.out });
  console.log("wrote", job.out);
  await context.close();
}
await browser.close();
