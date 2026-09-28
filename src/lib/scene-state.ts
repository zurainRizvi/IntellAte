/**
 * Mutable per-frame values shared between the GSAP timeline (writer of scroll
 * progress) and the render loop (sole owner of camera and uniforms). Kept out of
 * React state so scrolling never triggers re-renders.
 */
export const sceneState = {
  /** 0 = hero framing, 1 = face-on. Written by ScrollTrigger. */
  orbit: 0,
  /** 0..1 growth of the smoke branch. Written by ScrollTrigger. */
  branch: 0,
  paused: false,
  /** Side-approach entrance into the hero framing. */
  entrance: null as null | { kind: "arrival" | "none"; startedAt: number },
};

export function beginArrival() {
  sceneState.entrance = { kind: "arrival", startedAt: performance.now() };
}

export const sceneEvents = {
  sceneFallback: "intellate:scene-fallback",
  motionPause: "intellate:motion-pause",
} as const;
