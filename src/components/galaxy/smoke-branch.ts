import { AdditiveBlending, Mesh, PlaneGeometry, ShaderMaterial, Vector3, type Camera } from "three";
import { smokeFragment, smokeVertex } from "./shaders";

type V2 = [number, number];

const bez = (a: V2, b: V2, c: V2, d: V2, t: number): V2 => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};

export type SmokeFrame = {
  camera: Camera;
  width: number;
  height: number;
  dpr: number;
  card: DOMRect;
  grow: number;
  time: number;
};

/**
 * One branching smoke connector from the galaxy's outskirts to a card. It ends
 * `gap` pixels short of the card edge and fades out well before that point.
 */
export function createSmokeBranch() {
  const v = (): { value: V2 } => ({ value: [0, 0] });
  const uniforms = {
    uBox: { value: [-1, -1, 1, 1] },
    uP0: v(), uP1: v(), uP2: v(), uP3: v(), uF0: v(), uF1: v(), uF2: v(), uF3: v(),
    uGrow: { value: 0 },
    uTime: { value: 0 },
    uWidth: { value: 12 },
    uOpacity: { value: 0 },
  };
  const material = new ShaderMaterial({
    vertexShader: smokeVertex,
    fragmentShader: smokeFragment,
    uniforms,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const geometry = new PlaneGeometry(2, 2);
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  mesh.visible = false;

  const center = new Vector3();
  const edge = new Vector3();

  function update(f: SmokeFrame | null) {
    mesh.visible = !!f && f.grow > 0.001;
    if (!f || !mesh.visible) return;
    const W = f.width * f.dpr;
    const H = f.height * f.dpr;
    const toPx = (p: Vector3): V2 => [(p.x * 0.5 + 0.5) * W, (p.y * 0.5 + 0.5) * H];

    const c = toPx(center.set(0, 0, 0).project(f.camera));
    const e = toPx(edge.setFromMatrixColumn(f.camera.matrixWorld, 0).project(f.camera));
    const radius = Math.hypot(e[0] - c[0], e[1] - c[1]);

    const r = f.card;
    const gap = 30 * f.dpr;
    const horizontal = r.right * f.dpr < c[0];
    const end: V2 = horizontal
      ? [r.right * f.dpr + gap, H - (r.top + r.height * 0.42) * f.dpr]
      : [(r.left + r.width * 0.5) * f.dpr, H - r.top * f.dpr + gap];
    const dx = end[0] - c[0];
    const dy = end[1] - c[1];
    const l0 = Math.hypot(dx, dy) || 1;
    const start: V2 = [c[0] + (dx / l0) * radius * 0.68, c[1] + (dy / l0) * radius * 0.68];
    const d: V2 = [end[0] - start[0], end[1] - start[1]];
    const len = Math.hypot(d[0], d[1]) || 1;
    const n: V2 = [-d[1] / len, d[0] / len];
    const p1: V2 = [start[0] + d[0] * 0.33 + n[0] * len * 0.12, start[1] + d[1] * 0.33 + n[1] * len * 0.12];
    const p2: V2 = [start[0] + d[0] * 0.68 - n[0] * len * 0.08, start[1] + d[1] * 0.68 - n[1] * len * 0.08];

    const f0 = bez(start, p1, p2, end, 0.42);
    const fa = Math.atan2(d[1], d[0]) + (horizontal ? -0.5 : 0.5);
    const fl = len * 0.3;
    const f3: V2 = [f0[0] + Math.cos(fa) * fl, f0[1] + Math.sin(fa) * fl];
    const f1: V2 = [f0[0] + (f3[0] - f0[0]) * 0.35 + n[0] * fl * 0.1, f0[1] + (f3[1] - f0[1]) * 0.35 + n[1] * fl * 0.1];
    const f2: V2 = [f0[0] + (f3[0] - f0[0]) * 0.7, f0[1] + (f3[1] - f0[1]) * 0.7];

    const width = Math.max(8, Math.min(16, (len / f.dpr) * 0.05)) * f.dpr;
    const pad = width * 4;
    const xs = [start[0], p1[0], p2[0], end[0], f3[0]];
    const ys = [start[1], p1[1], p2[1], end[1], f3[1]];
    uniforms.uBox.value = [
      ((Math.min(...xs) - pad) / W) * 2 - 1,
      ((Math.min(...ys) - pad) / H) * 2 - 1,
      ((Math.max(...xs) + pad) / W) * 2 - 1,
      ((Math.max(...ys) + pad) / H) * 2 - 1,
    ];
    uniforms.uP0.value = start;
    uniforms.uP1.value = p1;
    uniforms.uP2.value = p2;
    uniforms.uP3.value = end;
    uniforms.uF0.value = f0;
    uniforms.uF1.value = f1;
    uniforms.uF2.value = f2;
    uniforms.uF3.value = f3;
    uniforms.uGrow.value = f.grow * 1.1;
    uniforms.uTime.value = f.time;
    uniforms.uWidth.value = width;
    uniforms.uOpacity.value = Math.min(1, f.grow * 2.5) * 0.55;
  }

  return {
    mesh,
    update,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
