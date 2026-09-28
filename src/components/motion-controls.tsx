"use client";

import { useLayoutEffect, useState } from "react";
import { applyBootAttributes } from "@/lib/boot-script";
import { sceneState } from "@/lib/scene-state";

export function PauseMotionButton({ className }: { className?: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={paused}
      onClick={() => {
        sceneState.paused = !paused;
        setPaused(!paused);
      }}
    >
      {paused ? "Resume motion" : "Pause motion"}
    </button>
  );
}

/** React's dev-mode remount strips attributes set by the boot script; re-apply them. */
export function BootAttributes() {
  useLayoutEffect(() => {
    if (window.__intellateBoot) applyBootAttributes(window.__intellateBoot);
  }, []);
  return null;
}
