/**
 * Mutable per-frame values shared between the GSAP timeline (writer of scroll
 * progress) and the render loop (sole owner of camera and uniforms). Kept out of
 * React state so scrolling never triggers re-renders.
 */
export type IntroOutcome = "completed" | "skipped" | "bypassed";

export const sceneState = {
  /** 0 = hero framing, 1 = face-on. Written by ScrollTrigger. */
  orbit: 0,
  /** 0..1 growth of the smoke branch. Written by ScrollTrigger. */
  branch: 0,
  paused: false,
  /** How the live scene should begin once the intro resolves. */
  entrance: null as null | { kind: "arrival" | "settle" | "none"; startedAt: number },
};

export function beginEntrance(outcome: IntroOutcome) {
  const kind = outcome === "completed" ? "settle" : "arrival";
  sceneState.entrance = { kind, startedAt: performance.now() };
}

export const sceneEvents = {
  introEnd: "intellate:intro-end",
  introReplay: "intellate:intro-replay",
  sceneFallback: "intellate:scene-fallback",
  motionPause: "intellate:motion-pause",
} as const;
