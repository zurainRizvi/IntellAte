"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PerspectiveCamera } from "three";
import { motion, poses, type Layout } from "@/config/motion";
import { sceneState } from "@/lib/scene-state";
import { applyPose, ease, lerpPose } from "./camera";
import { createGalaxyScene } from "./galaxy-scene";
import { pickQualityTier, type QualityTier } from "./generate";
import { createSmokeBranch } from "./smoke-branch";

type FallbackReason = "webgl-error" | "context-lost";

class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function GalaxyCanvas({ onFallback }: { onFallback: (reason: FallbackReason) => void }) {
  const [tier] = useState<QualityTier>(pickQualityTier);
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" data-tier={tier}>
      <SceneErrorBoundary onError={() => onFallback("webgl-error")}>
        <Canvas
          dpr={[1, tier === "high" ? 2 : 1.5]}
          flat
          linear
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          camera={{ fov: motion.fov, near: 0.002, far: 200, position: [0, 0, 3] }}
          onCreated={({ gl }) => {
            gl.setClearColor("#000000", 1);
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              onFallback("context-lost");
            });
          }}
        >
          <Galaxy tier={tier} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

type PoseName = keyof (typeof poses)["desktop"];

/** Review aid: `?camera=arrival|match|hero|face` holds a pose for reference-frame comparisons. */
function readHeldPose(): PoseName | null {
  const v = new URLSearchParams(location.search).get("camera");
  return v === "arrival" || v === "match" || v === "hero" || v === "face" ? v : null;
}

function currentPose(layout: Layout, orbit: number, now: number, held: PoseName | null) {
  const P = poses[layout];
  if (held) return P[held];
  const scrolled = lerpPose(P.hero, P.face, ease.inOutSine(orbit));
  const introPlaying = document.documentElement.dataset.intro === "play";
  if (!sceneState.entrance && !introPlaying) sceneState.entrance = { kind: "arrival", startedAt: now };
  const entrance = sceneState.entrance;
  if (!entrance) return P.match;
  if (entrance.kind === "arrival") {
    const k = (now - entrance.startedAt) / 1000 / motion.arrivalSeconds;
    if (k < 1) return lerpPose(P.arrival, scrolled, ease.outQuart(Math.max(0, k)));
  } else if (entrance.kind === "settle") {
    const k = (now - entrance.startedAt) / 1000 / motion.settleSeconds;
    if (k < 1) return lerpPose(P.match, scrolled, ease.inOutSine(Math.max(0, k)));
  }
  return scrolled;
}

function Galaxy({ tier }: { tier: QualityTier }) {
  const galaxy = useMemo(() => createGalaxyScene(tier), [tier]);
  const smoke = useMemo(() => createSmokeBranch(), []);
  const [held] = useState(readHeldPose);
  useEffect(() => () => galaxy.dispose(), [galaxy]);
  useEffect(() => () => smoke.dispose(), [smoke]);

  const { size, viewport, setDpr } = useThree();
  const loop = useRef({ orbit: 0, time: 0, frames: 0, elapsed: 0, ready: false, card: null as Element | null });
  const layout: Layout = size.width < 768 || size.width / size.height < 0.8 ? "mobile" : "desktop";

  useFrame((state, delta) => {
    const s = loop.current;
    const dt = Math.min(delta, 0.1);
    const camera = state.camera as PerspectiveCamera;
    if (!sceneState.paused) s.time += dt;

    s.orbit += (sceneState.orbit - s.orbit) * (1 - Math.exp(-motion.cameraDamping * dt));
    applyPose(camera, currentPose(layout, s.orbit, performance.now(), held), size.width, size.height);

    const dpr = viewport.dpr;
    galaxy.update({ camera, time: s.time, heightPx: size.height, dpr });

    s.card ??= document.querySelector("[data-card]");
    smoke.update(
      s.card && sceneState.branch > 0
        ? {
            camera,
            width: size.width,
            height: size.height,
            dpr,
            card: s.card.getBoundingClientRect(),
            grow: sceneState.branch,
            time: s.time,
          }
        : null,
    );

    // Adaptive resolution: step DPR down while frames stay slow.
    s.frames++;
    s.elapsed += delta;
    if (s.elapsed > 2) {
      if (s.elapsed / s.frames > 1 / 40 && dpr > 1) setDpr(Math.max(1, dpr - 0.25));
      s.frames = 0;
      s.elapsed = 0;
    }
    if (!s.ready) {
      s.ready = true;
      document.documentElement.dataset.sceneReady = "";
    }
  });

  return (
    <>
      <primitive object={galaxy.group} dispose={null} />
      <primitive object={smoke.mesh} dispose={null} />
    </>
  );
}
