import { Matrix4, PerspectiveCamera, Vector3 } from "three";
import type { CameraPose } from "@/config/motion";

const DEG = Math.PI / 180;

export function lerpPose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    inclination: l(a.inclination, b.inclination),
    azimuth: l(a.azimuth, b.azimuth),
    roll: l(a.roll, b.roll),
    distance: l(a.distance, b.distance),
    screenX: l(a.screenX, b.screenX),
    screenY: l(a.screenY, b.screenY),
    targetOffset: l(a.targetOffset, b.targetOffset),
  };
}

const dir = new Vector3();
const right = new Vector3();
const up = new Vector3();
const target = new Vector3();
const basis = new Matrix4();

/**
 * Orbit camera around the galaxy (disc in XY, normal +Z). `right` is always
 * tangent to the disc, so edge-on views keep the disc level before roll.
 */
export function applyPose(camera: PerspectiveCamera, pose: CameraPose, width: number, height: number) {
  const inc = pose.inclination * DEG;
  const az = pose.azimuth * DEG;
  dir.set(Math.sin(inc) * Math.cos(az), Math.sin(inc) * Math.sin(az), Math.cos(inc));
  right.set(-Math.sin(az), Math.cos(az), 0);
  up.crossVectors(dir, right);

  const roll = pose.roll * DEG;
  const c = Math.cos(roll);
  const s = Math.sin(roll);
  const rx = right.clone().multiplyScalar(c).addScaledVector(up, s);
  const ux = up.multiplyScalar(c).addScaledVector(right, -s);

  target.copy(right).multiplyScalar(pose.targetOffset);
  camera.position.copy(target).addScaledVector(dir, pose.distance);
  basis.makeBasis(rx, ux, dir);
  camera.quaternion.setFromRotationMatrix(basis);

  camera.setViewOffset(
    width,
    height,
    width / 2 - pose.screenX * width,
    height / 2 - pose.screenY * height,
    width,
    height,
  );
  camera.updateMatrixWorld();
}

export const ease = {
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  smooth: (t: number) => t * t * (3 - 2 * t),
};
