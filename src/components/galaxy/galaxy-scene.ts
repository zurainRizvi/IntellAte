import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  DstColorFactor,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
  ZeroFactor,
  type Camera,
} from "three";
import { motion } from "@/config/motion";
import { generateGalaxy, WIND, type ParticleLayer, type QualityTier } from "./generate";
import {
  coreFragment,
  coreVertex,
  discGlowFragment,
  discVertex,
  dustFragment,
  fieldVertex,
  hazeFragment,
  starFragment,
} from "./shaders";

function geometryFor(l: ParticleLayer) {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(l.position, 3));
  g.setAttribute("aColor", new BufferAttribute(l.color, 3));
  g.setAttribute("aSize", new BufferAttribute(l.size, 1));
  return g;
}

const additive = { blending: AdditiveBlending, depthTest: false, depthWrite: false, transparent: true } as const;

export type GalaxyFrame = { camera: Camera; time: number; heightPx: number; dpr: number };

/**
 * Builds every GPU resource for the galaxy. Draw order implements dust
 * occlusion: far half of the disc, disc light and core, dust, then near half.
 */
export function createGalaxyScene(tier: QualityTier) {
  const data = generateGalaxy(tier);
  const shared = {
    uTime: { value: 0 },
    uOmega: { value: (Math.PI * 2) / motion.outerRotationPeriod },
    uPxPerUnit: { value: 1000 },
    uMinPx: { value: 1 },
    uCamSide: { value: 1 },
  };
  const starMaxPx = { value: 3 };
  const spriteMaxPx = { value: 72 };
  const hazeMaxPx = { value: 32 };
  const starSplitZ = { value: 0 };
  const nearFade = { stars: [0.015, 0.09], haze: [0.12, 0.55], dust: [0.04, 0.25] } as const;
  const disc = (
    fragmentShader: string,
    pass: number,
    maxPx: { value: number },
    fade: readonly [number, number],
    splitZ: { value: number } = { value: 0 },
  ) =>
    new ShaderMaterial({
      vertexShader: discVertex,
      fragmentShader,
      uniforms: {
        ...shared,
        uMaxPx: maxPx,
        uNearFade: { value: [...fade] },
        uSplitZ: splitZ,
        uPass: { value: pass },
        uOpacity: { value: 1 },
      },
      ...additive,
    });

  const mat = {
    starsFar: disc(starFragment, -1, starMaxPx, nearFade.stars, starSplitZ),
    starsNear: disc(starFragment, 1, starMaxPx, nearFade.stars, starSplitZ),
    bulgeFar: disc(starFragment, -1, starMaxPx, nearFade.stars),
    bulgeNear: disc(starFragment, 1, starMaxPx, nearFade.stars),
    hazeFar: disc(hazeFragment, -1, hazeMaxPx, nearFade.haze),
    hazeNear: disc(hazeFragment, 1, hazeMaxPx, nearFade.haze),
    dust: new ShaderMaterial({
      vertexShader: discVertex,
      fragmentShader: dustFragment,
      uniforms: {
        ...shared,
        uMaxPx: spriteMaxPx,
        uNearFade: { value: [...nearFade.dust] },
        uSplitZ: { value: 0 },
        uPass: { value: 0 },
        uStrength: { value: 1 },
      },
      blending: CustomBlending,
      blendSrc: DstColorFactor,
      blendDst: ZeroFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    }),
    field: new ShaderMaterial({
      vertexShader: fieldVertex,
      fragmentShader: starFragment,
      uniforms: { uDpr: { value: 1 }, uOpacity: { value: 0.85 } },
      ...additive,
    }),
    core: new ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      uniforms: { uColor: { value: new Vector3(1.0, 0.9, 0.74) }, uOpacity: { value: 1 } },
      ...additive,
    }),
    glow: new ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: discGlowFragment,
      uniforms: {
        uTime: shared.uTime,
        uOmega: shared.uOmega,
        uWind: { value: WIND },
        uIntensity: { value: 2.6 },
        uFacing: { value: 1 },
      },
      ...additive,
    }),
  };
  const geo = {
    stars: geometryFor(data.stars),
    bulge: geometryFor(data.bulge),
    haze: geometryFor(data.haze),
    dust: geometryFor(data.dust),
    field: geometryFor(data.field),
    core: new PlaneGeometry(1.1, 1.1),
    glow: new PlaneGeometry(2.2, 2.2),
  };

  const group = new Group();
  const add = (obj: Points | Mesh, order: number) => {
    obj.frustumCulled = false;
    obj.renderOrder = order;
    group.add(obj);
  };
  add(new Points(geo.field, mat.field), 0);
  add(new Points(geo.stars, mat.starsFar), 1);
  add(new Points(geo.bulge, mat.bulgeFar), 1);
  add(new Points(geo.haze, mat.hazeFar), 2);
  add(new Mesh(geo.glow, mat.glow), 3);
  add(new Mesh(geo.core, mat.core), 3);
  add(new Points(geo.dust, mat.dust), 4);
  add(new Points(geo.haze, mat.hazeNear), 5);
  add(new Points(geo.stars, mat.starsNear), 6);
  add(new Points(geo.bulge, mat.bulgeNear), 6);

  function update(f: GalaxyFrame) {
    shared.uTime.value = f.time;
    shared.uPxPerUnit.value = (f.heightPx * f.dpr) / (2 * Math.tan((motion.fov * Math.PI) / 360));
    shared.uMinPx.value = Math.max(1, 0.85 * f.dpr);
    starMaxPx.value = 3.2 * f.dpr;
    spriteMaxPx.value = 72 * f.dpr;
    hazeMaxPx.value = 14 * f.dpr;
    shared.uCamSide.value = f.camera.position.z >= 0 ? 1 : -1;
    mat.field.uniforms.uDpr.value = f.dpr;
    const p = f.camera.position;
    mat.glow.uniforms.uFacing.value = Math.abs(p.z) / (p.length() || 1);
    // Dust reads strongest edge-on, where the optical path through the disc is longest; there,
    // stars inside the dust layer are drawn behind it so the lane stays dark.
    const facing = mat.glow.uniforms.uFacing.value;
    mat.dust.uniforms.uStrength.value = 1.3 - 1.18 * facing;
    starSplitZ.value = 0.014 * (1 - facing) ** 3;
  }

  return {
    group,
    update,
    dispose() {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mat).forEach((m) => m.dispose());
    },
  };
}
