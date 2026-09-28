#!/usr/bin/env node
/**
 * Lab performance profile against a production server (default :4318, the draft-visible preview build).
 *   node scripts/lab/perf.mjs
 * Loading metrics come from PerformanceObserver; frame pacing from rAF deltas during a scripted
 * scroll through the journey. Throttling uses Chrome DevTools Protocol emulation.
 */
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4318";
const runs = Number(process.env.RUNS || 3);

const profiles = [
  { name: "desktop-1440x900@1x-unthrottled", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "desktop-1440x900@2x-unthrottled", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  {
    name: "mobile-390x844@3x-slow4g-cpu4x",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    cpu: 4,
    // Lighthouse "Slow 4G" preset: 150 ms RTT, 1.6 Mbps down, 750 Kbps up.
    network: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  },
];

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};

async function measure(p) {
  const { cpu, network, viewport, deviceScaleFactor, isMobile, hasTouch } = p;
  const context = await browser.newContext({ viewport, deviceScaleFactor, isMobile, hasTouch });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (network) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...network });
  if (cpu) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

  let bytes = { total: 0, js: 0 };
  cdp.on("Network.loadingFinished", (e) => (bytes.total += e.encodedDataLength));
  const jsIds = new Set();
  cdp.on("Network.responseReceived", (e) => e.type === "Script" && jsIds.add(e.requestId));
  cdp.on("Network.loadingFinished", (e) => jsIds.has(e.requestId) && (bytes.js += e.encodedDataLength));

  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0, longTasks: 0, longTaskMs: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__perf.cls += e.value))).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__perf.longTasks++; window.__perf.longTaskMs += e.duration; })).observe({ type: "longtask", buffered: true });
  });

  const t0 = Date.now();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForSelector("html[data-scene-ready]", { timeout: 60000 });
  const sceneReadyMs = Date.now() - t0;
  await page.waitForTimeout(1500);

  const load = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    return {
      ttfb: Math.round(nav.responseStart),
      fcp: Math.round(fcp),
      lcp: Math.round(window.__perf.lcp),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      cls: +window.__perf.cls.toFixed(4),
      longTasks: window.__perf.longTasks,
      longTaskMs: Math.round(window.__perf.longTaskMs),
      tier: document.querySelector("[data-tier]")?.getAttribute("data-tier"),
    };
  });

  const frames = await page.evaluate(async () => {
    const el = document.querySelector("#journey");
    const top = el.getBoundingClientRect().top + scrollY;
    const span = el.offsetHeight - innerHeight;
    const deltas = [];
    let last = performance.now();
    const start = last;
    const dur = 8000;
    await new Promise((resolve) => {
      const tick = (now) => {
        deltas.push(now - last);
        last = now;
        const t = Math.min(1, (now - start) / dur);
        window.scrollTo(0, top + span * t);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return deltas.slice(1);
  });
  const sorted = [...frames].sort((a, b) => a - b);
  const q = (p) => +sorted[Math.floor(p * (sorted.length - 1))].toFixed(1);
  const dpr = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c ? +(c.width / c.clientWidth).toFixed(2) : null;
  });
  await context.close();
  return {
    ...load,
    sceneReadyMs,
    transferKB: Math.round(bytes.total / 1024),
    jsKB: Math.round(bytes.js / 1024),
    fps: +(1000 / (frames.reduce((a, b) => a + b, 0) / frames.length)).toFixed(1),
    frameP50: q(0.5),
    frameP95: q(0.95),
    over33ms: +((frames.filter((f) => f > 33.4).length / frames.length) * 100).toFixed(1),
    canvasDprAtEnd: dpr,
  };
}

const out = {};
for (const p of profiles) {
  const samples = [];
  for (let i = 0; i < runs; i++) samples.push(await measure(p));
  const keys = Object.keys(samples[0]).filter((k) => typeof samples[0][k] === "number");
  out[p.name] = Object.fromEntries([
    ...keys.map((k) => [k, median(samples.map((s) => s[k]))]),
    ["tier", samples[0].tier],
    ["runs", runs],
  ]);
  console.log(p.name, JSON.stringify(out[p.name]));
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
