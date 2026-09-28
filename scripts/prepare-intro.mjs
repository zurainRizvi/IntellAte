#!/usr/bin/env node
/**
 * Builds web-friendly intro derivatives into public/media/ (gitignored) from the
 * untouched source in reference-videos/. The source file is only read.
 * Requires ffmpeg on PATH or FFMPEG_PATH.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "reference-videos/Galaxy_Intro_Clean_Original.mp4");
const outDir = resolve(root, "public/media");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";

if (!existsSync(source)) {
  console.error(`Source footage not found: ${source}\nThe site still runs; the intro is skipped when the video is missing.`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const variants = [
  { name: "intro-1080.mp4", scale: "1080:-2", crf: "21" },
  { name: "intro-720.mp4", scale: "720:-2", crf: "24" },
];

for (const v of variants) {
  const out = resolve(outDir, v.name);
  const args = [
    "-v", "error", "-y", "-i", source,
    "-vf", `scale=${v.scale}:flags=lanczos`,
    "-c:v", "libx264", "-preset", "slow", "-crf", v.crf, "-pix_fmt", "yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-movflags", "+faststart", "-an", out,
  ];
  const r = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`ffmpeg failed for ${v.name}. Set FFMPEG_PATH if ffmpeg is not on PATH.`);
    process.exit(r.status ?? 1);
  }
  console.log(`${v.name}: ${(statSync(out).size / 1e6).toFixed(2)} MB`);
}
