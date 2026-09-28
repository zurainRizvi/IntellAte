/**
 * Editable animation parameters. Angles in degrees, distances in galaxy radii,
 * screenX/screenY as viewport fractions where the camera target lands on screen.
 */
export type CameraPose = {
  inclination: number; // 90 = edge-on, 0 = face-on
  azimuth: number;
  roll: number;
  distance: number;
  screenX: number;
  screenY: number;
  /** Camera target offset from the core along the disc, in galaxy radii. */
  targetOffset: number;
};

export type Layout = "desktop" | "mobile";

/**
 * `match` reproduces the last frame of the intro footage at height-fit framing:
 * core at 52.4% / 55.8% of the portrait frame, major axis rising to the upper right.
 */
const matchPose: CameraPose = {
  inclination: 73,
  azimuth: 0,
  roll: -65,
  distance: 0.85,
  screenX: 0.5,
  screenY: 0.558,
  targetOffset: 0,
};

export const poses: Record<Layout, Record<"arrival" | "match" | "hero" | "face", CameraPose>> = {
  desktop: {
    arrival: { inclination: 88, azimuth: -38, roll: -80, distance: 0.62, screenX: 0.5, screenY: 0.5, targetOffset: 0.38 },
    match: matchPose,
    hero: { ...matchPose, screenX: 0.6, distance: 0.95 },
    face: { inclination: 14, azimuth: 42, roll: -6, distance: 2.3, screenX: 0.64, screenY: 0.5, targetOffset: 0 },
  },
  mobile: {
    arrival: { inclination: 88, azimuth: -38, roll: -80, distance: 0.7, screenX: 0.5, screenY: 0.5, targetOffset: 0.38 },
    match: matchPose,
    hero: { ...matchPose, screenY: 0.6, distance: 1.0 },
    face: { inclination: 16, azimuth: 42, roll: -6, distance: 4.6, screenX: 0.5, screenY: 0.33, targetOffset: 0 },
  },
};

export const motion = {
  fov: 50,
  /** Arrival when the intro is skipped or bypassed: side approach, then deceleration. */
  arrivalSeconds: 3.4,
  /** After a natural intro ending, settle from the footage framing into the hero framing. */
  settleSeconds: 2.4,
  introCrossfadeMs: 700,
  introSkipFadeMs: 320,
  /** Seconds before the video ends when the crossfade to the live scene begins. */
  introCrossfadeLead: 0.55,
  /** Abort the intro if playback has not started within this window. */
  introStartTimeoutMs: 3500,
  /** Scroll length of the journey stage, in viewport heights. */
  stageLengthVh: 320,
  /** Camera damping toward the scroll target (higher settles faster). */
  cameraDamping: 3.2,
  /** Idle galaxy rotation: seconds per outer-disc revolution. */
  outerRotationPeriod: 900,
  timeline: {
    heroOut: [0.0, 0.18],
    orbit: [0.0, 0.62],
    branch: [0.56, 0.8],
    card: [0.74, 0.9],
  },
} as const;

export const introStorageKey = "intellate:intro-seen";
