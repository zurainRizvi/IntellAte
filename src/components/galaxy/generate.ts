/**
 * Deterministic particle generation for the galaxy. Units: galaxy radius = 1,
 * disc in the local XY plane, normal along +Z. Positions are stored as
 * (radius, angle, height) so the shader can apply differential rotation.
 */

export type QualityTier = "high" | "medium" | "low";

export type ParticleLayer = {
  /** (r, theta, z) per particle */
  position: Float32Array;
  color: Float32Array;
  size: Float32Array;
  count: number;
};

export type GalaxyData = {
  stars: ParticleLayer;
  bulge: ParticleLayer;
  haze: ParticleLayer;
  dust: ParticleLayer;
  field: ParticleLayer;
};

const counts: Record<QualityTier, Record<keyof GalaxyData, number>> = {
  high: { stars: 440_000, bulge: 40_000, haze: 18_000, dust: 26_000, field: 5_000 },
  medium: { stars: 220_000, bulge: 24_000, haze: 11_000, dust: 19_000, field: 3_500 },
  low: { stars: 100_000, bulge: 14_000, haze: 6_000, dust: 13_000, field: 2_500 },
};

const PITCH = (13 * Math.PI) / 180;
const ARM_R0 = 0.07;
export const WIND = 1 / Math.tan(PITCH);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(rand: () => number) {
  const size = 256;
  const table = new Float32Array(size * size);
  for (let i = 0; i < table.length; i++) table[i] = rand();
  const at = (x: number, y: number) => table[(y & (size - 1)) * size + (x & (size - 1))];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * tx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * tx;
    return a + (b - a) * ty;
  };
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * value(x * f + 17.3 * o, y * f - 9.1 * o);
      f *= 2.03;
      amp *= 0.5;
    }
    return sum / 0.9375;
  };
}

function layer(count: number): ParticleLayer {
  return {
    position: new Float32Array(count * 3),
    color: new Float32Array(count * 3),
    size: new Float32Array(count),
    count,
  };
}

const palette = {
  ivory: [1.0, 0.95, 0.9],
  warmWhite: [1.0, 0.98, 0.96],
  gold: [1.0, 0.86, 0.68],
  paleBlue: [0.74, 0.83, 1.0],
  hii: [1.0, 0.36, 0.32],
  haze: [0.86, 0.8, 0.76],
  dust: [0.2, 0.14, 0.11],
} as const;

export function generateGalaxy(tier: QualityTier, seed = 20260928): GalaxyData {
  const rand = mulberry32(seed);
  const noise = makeNoise(rand);
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const n = counts[tier];
  // Keep total light constant across tiers.
  const flux = (key: keyof GalaxyData) => Math.sqrt(counts.high[key] / n[key]);

  const sampleDiscRadius = (scale: number, max: number) => {
    const k = 1 - Math.exp(-max / scale);
    return -scale * Math.log(1 - rand() * k);
  };
  const pickArm = () => {
    const u = rand();
    return u < 0.4 ? 0 : u < 0.8 ? 1 : u < 0.9 ? 0.5 : 1.5;
  };
  const armAngle = (r: number, arm: number) => arm * Math.PI + Math.log(Math.max(r, ARM_R0) / ARM_R0) * WIND;

  /** Clumpy arm-biased disc placement; rejection against fBm keeps it from reading as an even spiral. */
  const placeInDisc = (armFraction: number, armWidth: number, clump: number) => {
    for (;;) {
      const r = 0.035 + sampleDiscRadius(0.3, 1.05);
      const onArm = rand() < armFraction;
      const theta = onArm
        ? armAngle(r, pickArm()) + gauss() * armWidth * (0.55 + r)
        : rand() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const density = noise(x * 7 + 40, y * 7 + 40);
      if (rand() < 1 - clump + clump * density * density * 1.6) return { r, theta, onArm };
    }
  };

  const setColor = (l: ParticleLayer, i: number, c: readonly number[], k: number) => {
    l.color[i * 3] = c[0] * k;
    l.color[i * 3 + 1] = c[1] * k;
    l.color[i * 3 + 2] = c[2] * k;
  };
  const mix = (a: readonly number[], b: readonly number[], t: number) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];

  // Disc stars
  const stars = layer(n.stars);
  const fs = flux("stars");
  for (let i = 0; i < stars.count; i++) {
    const p = placeInDisc(0.56, 0.32, 0.35);
    const z = gauss() * (0.012 + 0.028 * p.r) * (p.onArm ? 0.8 : 1.25);
    stars.position.set([p.r, p.theta, z], i * 3);
    const roll = rand();
    let c: readonly number[] = mix(palette.gold, palette.ivory, Math.min(1, p.r * 2.2));
    if (p.onArm && p.r > 0.28 && roll < 0.1) c = palette.paleBlue;
    else if (roll > 0.93) c = palette.warmWhite;
    const bright = Math.pow(rand(), 9);
    setColor(stars, i, c, (0.09 + 0.91 * bright) * 0.8 * fs);
    stars.size[i] = 0.001 + bright * 0.003;
  }

  // Sparse HII knots overwrite a small share of arm stars so the disc keeps its count.
  const knots = Math.floor(stars.count * 0.006);
  for (let k = 0; k < knots; k++) {
    const r = 0.25 + rand() * 0.7;
    const theta = armAngle(r, rand() < 0.5 ? 0 : 1) + gauss() * 0.05;
    const i = Math.floor(rand() * stars.count);
    stars.position.set([r + gauss() * 0.006, theta + gauss() * 0.01, gauss() * 0.004], i * 3);
    setColor(stars, i, palette.hii, 0.26 * fs);
    stars.size[i] = 0.0036;
  }

  // Thick disc / inner halo: sparse, brighter stars well above the plane that
  // pass in front of the camera during the side approach.
  const halo = Math.floor(stars.count * 0.025);
  for (let k = 0; k < halo; k++) {
    const i = Math.floor(rand() * stars.count);
    const r = 0.15 + sampleDiscRadius(0.5, 1.3);
    stars.position.set([r, rand() * Math.PI * 2, gauss() * (0.05 + 0.08 * r)], i * 3);
    const bright = Math.pow(rand(), 4);
    setColor(stars, i, rand() < 0.08 ? palette.paleBlue : palette.warmWhite, (0.12 + 0.6 * bright) * 0.7 * fs);
    stars.size[i] = 0.0014 + bright * 0.004;
  }

  // Bulge: Sérsic-like concentration, flattened, warm.
  const bulge = layer(n.bulge);
  const fb = flux("bulge");
  for (let i = 0; i < bulge.count; i++) {
    const rr = Math.min(0.3, 0.055 * Math.pow(-Math.log(Math.max(rand(), 1e-6)), 1.7));
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const x = rr * s * Math.cos(phi);
    const y = rr * s * Math.sin(phi);
    const z = rr * u * 0.38;
    bulge.position.set([Math.hypot(x, y), Math.atan2(y, x), z], i * 3);
    const c = mix(palette.warmWhite, palette.gold, Math.min(1, rr * 3.2 + rand() * 0.3));
    setColor(bulge, i, c, (0.035 + 0.09 * Math.pow(rand(), 3)) * fb);
    bulge.size[i] = 0.0012 + Math.pow(rand(), 5) * 0.0025;
  }

  // Haze: large, faint sprites for unresolved starlight.
  const haze = layer(n.haze);
  const fh = flux("haze");
  for (let i = 0; i < haze.count; i++) {
    const p = placeInDisc(0.5, 0.35, 0.2);
    haze.position.set([p.r, p.theta, gauss() * (0.018 + 0.025 * p.r)], i * 3);
    const c = mix(palette.gold, palette.haze, Math.min(1, p.r * 1.8));
    setColor(haze, i, c, 0.03 * (1.15 - p.r * 0.6) * fh * fh);
    haze.size[i] = 0.012 + rand() * 0.02;
  }

  // Dust: lanes on the concave side of each arm, feathered spurs and patchy inner filaments.
  const dust = layer(n.dust);
  for (let i = 0; i < dust.count; i++) {
    let r: number;
    let theta: number;
    for (;;) {
      const kind = rand();
      r = (kind < 0.82 ? 0.14 : 0.1) + sampleDiscRadius(0.32, 0.86);
      const lane = armAngle(r, pickArm()) - 0.22;
      theta =
        kind < 0.55
          ? lane + gauss() * 0.06 * (0.6 + r)
          : kind < 0.82
            ? lane + gauss() * 0.4 * (0.6 + r)
            : rand() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const d = noise(x * 9 + 91, y * 9 - 13);
      if (rand() < Math.min(1, Math.max(0, (d - 0.3) * 2.5))) break;
    }
    dust.position.set([r, theta, gauss() * 0.009], i * 3);
    setColor(dust, i, palette.dust, (0.1 + rand() * 0.18) * Math.sqrt(counts.high.dust / n.dust));
    dust.size[i] = 0.03 + rand() * 0.05;
  }

  // Field stars on a distant shell (fixed pixel size in the shader).
  const field = layer(n.field);
  for (let i = 0; i < field.count; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const R = 40;
    field.position.set([R * s * Math.cos(phi), R * s * Math.sin(phi), R * u], i * 3);
    const roll = rand();
    const c = roll < 0.05 ? palette.paleBlue : roll < 0.09 ? palette.gold : palette.warmWhite;
    const bright = Math.pow(rand(), 5);
    setColor(field, i, c, 0.18 + 0.82 * bright);
    field.size[i] = 1 + bright * 1.8;
  }

  return { stars, bulge, haze, dust, field };
}

export function pickQualityTier(): QualityTier {
  const forced = new URLSearchParams(location.search).get("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (w < 768 || cores <= 4 || memory <= 2) return "low";
  if (cores < 8 || memory < 8) return "medium";
  return "high";
}
