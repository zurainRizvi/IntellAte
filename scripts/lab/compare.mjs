#!/usr/bin/env node
/**
 * Side-by-side reference vs prototype with luminance/colour statistics.
 *   node scripts/lab/compare.mjs <reference.png> <prototype.png> <out.png> [height=780]
 */
import sharp from "sharp";

const [ref, proto, out, h = "780"] = process.argv.slice(2);
const height = Number(h);

async function panel(file) {
  const img = sharp(file).resize({ height, fit: "inside" });
  const { data, info } = await img.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const lum = [];
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 3) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    lum.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  }
  const n = lum.length;
  lum.sort((x, y) => x - y);
  const q = (p) => Math.round(lum[Math.floor(p * (n - 1))]);
  return {
    buf: await img.png().toBuffer(),
    width: info.width,
    stats: {
      meanRGB: [r, g, b].map((v) => Math.round(v / n)),
      lumP50: q(0.5), lumP75: q(0.75), lumP90: q(0.9), lumP99: q(0.99),
      brightShare: +(lum.filter((v) => v > 200).length / n * 100).toFixed(2),
    },
  };
}

const [a, b] = await Promise.all([panel(ref), panel(proto)]);
const gap = 16;
const label = (text, x) =>
  `<text x="${x + 12}" y="28" font-family="Helvetica" font-size="18" fill="#f2e9d8">${text}</text>`;
const svg = Buffer.from(
  `<svg width="${a.width + b.width + gap}" height="40">${label("Reference", 0)}${label("Prototype (live WebGL)", a.width + gap)}</svg>`,
);
await sharp({ create: { width: a.width + b.width + gap, height: height + 40, channels: 3, background: "#111" } })
  .composite([
    { input: svg, top: 0, left: 0 },
    { input: a.buf, top: 40, left: 0 },
    { input: b.buf, top: 40, left: a.width + gap },
  ])
  .png()
  .toFile(out);
console.log(JSON.stringify({ out, reference: a.stats, prototype: b.stats }));
