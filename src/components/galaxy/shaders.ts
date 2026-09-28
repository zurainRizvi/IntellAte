/**
 * Disc particles are drawn in two passes split by the midplane (far half, then
 * dust, then near half) so dust lanes only darken light that lies behind them.
 */
export const discVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uTime;
  uniform float uOmega;
  uniform float uPxPerUnit;
  uniform float uMinPx;
  uniform float uMaxPx;
  uniform float uPass;
  uniform float uCamSide;
  uniform vec2 uNearFade;
  uniform float uSplitZ;
  varying vec3 vColor;
  varying float vFlux;

  void main() {
    float r = position.x;
    float th = position.y - uTime * uOmega / max(r, 0.14);
    vec3 p = vec3(r * cos(th), r * sin(th), position.z);
    // Stars inside the dust layer count as behind it, so edge-on views keep a dark lane.
    float side = p.z * uCamSide > uSplitZ ? 1.0 : -1.0;
    if (uPass != 0.0 && side != uPass) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(-mv.z, 1e-4);
    float px = aSize * uPxPerUnit / depth;
    float sz = clamp(px, uMinPx, uMaxPx);
    // Sub-pixel particles dim instead of shrinking, which keeps distant fields from aliasing.
    vFlux = min(1.0, pow(px / sz, 1.3)) * smoothstep(uNearFade.x, uNearFade.y, depth);
    vColor = aColor;
    gl_PointSize = sz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFlux;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c) * 4.0;
    if (d2 > 1.0) discard;
    float a = exp(-d2 * 5.0);
    gl_FragColor = vec4(vColor * a * vFlux * uOpacity, 1.0);
  }
`;

export const hazeFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFlux;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c) * 4.0;
    if (d2 > 1.0) discard;
    float a = exp(-d2 * 3.0) * (1.0 - d2);
    gl_FragColor = vec4(vColor * a * vFlux * uOpacity, 1.0);
  }
`;

/** Multiplicative: output colour scales what is already in the framebuffer. */
export const dustFragment = /* glsl */ `
  uniform float uStrength;
  varying vec3 vColor;
  varying float vFlux;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c) * 4.0;
    if (d2 > 1.0) discard;
    float a = (1.0 - d2) * (1.0 - d2) * uStrength * vFlux;
    // vColor.r carries opacity; tint is a warm brown.
    float k = clamp(vColor.r * 2.2 * a, 0.0, 0.85);
    gl_FragColor = vec4(mix(vec3(1.0), vec3(0.34, 0.25, 0.2), k) * (1.0 - k * 0.55), 1.0);
  }
`;

export const fieldVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vFlux;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vFlux = 1.0;
    gl_PointSize = aSize * uDpr;
    gl_Position = projectionMatrix * mv;
  }
`;

export const coreVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const coreFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float r2 = dot(vUv, vUv);
    float g = exp(-r2 / 0.0011) * 0.8 + exp(-r2 / 0.007) * 0.18;
    gl_FragColor = vec4(uColor * g * uOpacity, 1.0);
  }
`;

const noiseChunk = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float s = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.07 + 13.1; a *= 0.5; }
    return s;
  }
`;

/**
 * Unresolved starlight: a smooth in-plane light distribution that co-rotates
 * with the particles (same winding and rotation curve) and sits under the dust.
 */
export const discGlowFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOmega;
  uniform float uWind;
  uniform float uIntensity;
  uniform float uFacing;
  varying vec2 vUv;
  varying float vDepth;
  ${noiseChunk}
  void main() {
    float r = length(vUv);
    if (r > 1.08) discard;
    float th0 = atan(vUv.y, vUv.x) + uTime * uOmega / max(r, 0.14);
    float phase = th0 - log(max(r, 0.07) / 0.07) * uWind;
    float arm = pow(0.5 + 0.5 * cos(2.0 * phase), 2.2);
    vec2 q = r * vec2(cos(th0), sin(th0));
    float n = fbm(q * 5.5 + 3.0);
    float n2 = fbm(q * 17.0 - 5.0);
    float disc = exp(-r / 0.26) * (1.0 - smoothstep(0.45, 0.95, r));
    float light = disc * (0.45 + 0.55 * arm * (0.9 + 0.2 * n)) * (0.8 + 0.4 * n2);
    vec3 col = mix(vec3(1.0, 0.88, 0.72), vec3(0.8, 0.76, 0.74), smoothstep(0.08, 0.6, r));
    // Fade near the camera, where perspective would magnify the noise into visible blobs.
    float near = smoothstep(0.55, 1.1, vDepth);
    gl_FragColor = vec4(col * light * uIntensity * near * smoothstep(0.05, 0.3, uFacing), 1.0);
  }
`;

/**
 * Screen-space smoke connector: a cubic Bezier main stem and one short fork,
 * textured with flowing fBm. Drawn only inside its bounding box.
 */
export const smokeVertex = /* glsl */ `
  uniform vec4 uBox;
  void main() {
    vec2 t = position.xy * 0.5 + 0.5;
    gl_Position = vec4(mix(uBox.xy, uBox.zw, t), 0.0, 1.0);
  }
`;

export const smokeFragment = /* glsl */ `
  uniform vec2 uP0; uniform vec2 uP1; uniform vec2 uP2; uniform vec2 uP3;
  uniform vec2 uF0; uniform vec2 uF1; uniform vec2 uF2; uniform vec2 uF3;
  uniform float uGrow;
  uniform float uTime;
  uniform float uWidth;
  uniform float uOpacity;
  ${noiseChunk}
  vec2 bez(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
    float u = 1.0 - t;
    return u*u*u*a + 3.0*u*u*t*b + 3.0*u*t*t*c + t*t*t*d;
  }
  // Returns (distance, t) of the closest sampled point.
  vec2 closest(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d) {
    float best = 1e9; float bt = 0.0;
    for (int i = 0; i <= 28; i++) {
      float t = float(i) / 28.0;
      float dd = distance(p, bez(a, b, c, d, t));
      if (dd < best) { best = dd; bt = t; }
    }
    return vec2(best, bt);
  }
  float plume(vec2 p, vec2 dt, float grow, float width, float seed) {
    float t = dt.y;
    float w = width * mix(0.5, 1.9, t);
    // Two flowing noise fields: one streams along the stem, one breaks the edges into wisps.
    float n = fbm(vec2(t * 9.0 - uTime * 0.25 + seed, dt.x / w * 1.1 + uTime * 0.04));
    float n2 = fbm(p / (width * 1.6) + vec2(-uTime * 0.05, uTime * 0.03) + seed);
    float core = exp(-pow(dt.x / (w * (0.55 + 0.9 * n2)), 2.0) * 1.6);
    float ends = smoothstep(0.0, 0.2, t) * (1.0 - smoothstep(0.55, 0.95, t));
    float g = 1.0 - smoothstep(grow - 0.1, grow, t);
    return core * ends * g * smoothstep(0.3, 0.8, n) * (0.55 + 0.7 * n2) * 1.5;
  }
  void main() {
    vec2 p = gl_FragCoord.xy;
    vec2 m = closest(p, uP0, uP1, uP2, uP3);
    float dm = plume(p, m, uGrow, uWidth, 0.0);
    vec2 f = closest(p, uF0, uF1, uF2, uF3);
    float df = plume(p, f, (uGrow - 0.42) / 0.58, uWidth * 0.6, 7.3) * 0.7;
    float dens = clamp(dm + df, 0.0, 1.0);
    float along = mix(m.y, 0.42 + f.y * 0.58, step(dm, df));
    vec3 col = mix(vec3(0.86, 0.8, 0.7), vec3(0.6, 0.67, 0.84), smoothstep(0.1, 0.9, along));
    gl_FragColor = vec4(col * dens * uOpacity, 1.0);
  }
`;
